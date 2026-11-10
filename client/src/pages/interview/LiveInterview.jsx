import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import {
  Bot,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Code,
  Send,
  Sparkles,
  Award,
  ArrowRight,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Radio,
  RefreshCw,
  Camera,
  Hourglass,
  FastForward,
  Zap
} from 'lucide-react';

const TOTAL_INTERVIEW_LIMIT = 300; // 5 minutes total interview video duration
const QUESTION_TIME_LIMIT = 60; // 1 minute per question

const LiveInterview = () => {
  const { sessionId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Socket & Session State
  const [socket, setSocket] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);

  // Response State
  const [answerText, setAnswerText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  // Media & Camera State
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micPermission, setMicPermission] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  const [voiceAnswerActive, setVoiceAnswerActive] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  // Video & Audio Recording State for Recruiter
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isUploadingRecording, setIsUploadingRecording] = useState(false);
  const [recordingUploaded, setRecordingUploaded] = useState(false);

  // AI Evaluator State
  const [isThinking, setIsThinking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  // Timers: 5-minute total, 1-minute per question
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);
  const [questionSecondsLeft, setQuestionSecondsLeft] = useState(QUESTION_TIME_LIMIT);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoAdvanceNotice, setAutoAdvanceNotice] = useState('');

  // Media Refs
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Active state refs to avoid stale closures in timer intervals
  const answerTextRef = useRef('');
  const codeSnippetRef = useRef('');
  const questionIndexRef = useRef(0);
  const questionSecondsLeftRef = useRef(QUESTION_TIME_LIMIT);
  const totalSecondsElapsedRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const isUploadingRecordingRef = useRef(false);
  const socketRef = useRef(null);

  useEffect(() => { answerTextRef.current = answerText; }, [answerText]);
  useEffect(() => { codeSnippetRef.current = codeSnippet; }, [codeSnippet]);
  useEffect(() => { questionIndexRef.current = questionIndex; }, [questionIndex]);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  // AI Voice Narration (Text-to-Speech)
  const speakText = (text, onEnd) => {
    if (!speechEnabled || !('speechSynthesis' in window) || !text) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => setIsSpeakingAI(true);
      utterance.onend = () => {
        setIsSpeakingAI(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        setIsSpeakingAI(false);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeakingAI(false);
      if (onEnd) onEnd();
    }
  };

  // 1. Dual-Timer: 5-Minute Total Session & 1-Minute Per-Question Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      if (isUploadingRecordingRef.current) return;

      // 1. Total 5-Minute Session Limit
      totalSecondsElapsedRef.current += 1;
      setTotalSecondsElapsed(totalSecondsElapsedRef.current);

      if (totalSecondsElapsedRef.current >= TOTAL_INTERVIEW_LIMIT) {
        clearInterval(timer);
        advanceToNextQuestion(true);
        return;
      }

      // 2. 1-Minute Question Countdown
      if (!isTransitioningRef.current) {
        questionSecondsLeftRef.current -= 1;
        setQuestionSecondsLeft(questionSecondsLeftRef.current);

        // When 1 minute expires for this question, auto-advance!
        if (questionSecondsLeftRef.current <= 0) {
          advanceToNextQuestion(true);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Initialize Camera & Media Stream & MediaRecorder
  useEffect(() => {
    let active = true;

    async function setupCamera() {
      try {
        setCameraError('');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreamRef.current = stream;
        setMicPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Initialize MediaRecorder for full interview recording (Video + Audio)
        try {
          let selectedMimeType = 'video/webm;codecs=vp8,opus';
          if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported(selectedMimeType)) {
            selectedMimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '';
          }
          const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined;
          const recorder = new MediaRecorder(stream, options);

          recordedChunksRef.current = [];
          recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };

          recorder.onstart = () => {
            setIsRecordingVideo(true);
          };

          recorder.onstop = () => {
            setIsRecordingVideo(false);
          };

          recorder.start(1000); // 1-second chunks
          mediaRecorderRef.current = recorder;
        } catch (recErr) {
          console.warn('MediaRecorder not available or failed to start:', recErr);
        }

      } catch (err) {
        console.warn('Camera/Mic permission warning:', err.message);
        setCameraError('Camera or microphone access denied. You can still answer via typed text.');
        setCameraEnabled(false);
      }
    }

    if (cameraEnabled) {
      setupCamera();
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsRecordingVideo(false);
    }

    return () => {
      active = false;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraEnabled]);

  // Toggle Camera
  const toggleCamera = () => {
    setCameraEnabled((prev) => !prev);
  };

  // 3. Candidate Voice Answer (Speech-to-Text)
  const startVoiceAnswer = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your response.');
      return;
    }

    if (voiceAnswerActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setVoiceAnswerActive(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingAI(false);
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }

      if (finalTranscript) {
        setAnswerText((prev) => (prev ? prev.trim() + ' ' + finalTranscript.trim() : finalTranscript.trim()));
      }
    };

    recognition.onerror = (err) => {
      console.error('Speech recognition error:', err);
      setVoiceAnswerActive(false);
    };

    recognition.onend = () => {
      setVoiceAnswerActive(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setVoiceAnswerActive(true);
  };

  const stopVoiceAnswer = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setVoiceAnswerActive(false);
  };

  // 4. Setup Socket.io Real-Time Connection
  useEffect(() => {
    const socketInstance = io('/interview', {
      auth: { token }
    });

    socketInstance.on('connect', () => {
      console.log('Connected to interview socket namespace');
      socketInstance.emit('join-session', { sessionId });
    });

    socketInstance.on('session-joined', (data) => {
      setSessionData(data);
      if (data.questions && data.questions.length > 0) {
        const lastQ = data.questions[data.questions.length - 1];
        setQuestionIndex(lastQ.questionIndex);
        questionIndexRef.current = lastQ.questionIndex;
        setCurrentQuestion(lastQ);
        if (lastQ.evaluation?.score > 0) {
          setEvalResult(lastQ.evaluation);
        } else {
          speakText(lastQ.questionText);
        }
      } else {
        // Request first question
        socketInstance.emit('get-question', { sessionId, questionIndex: 0 });
      }
    });

    socketInstance.on('ai-thinking', () => {
      setIsThinking(true);
    });

    socketInstance.on('question-received', ({ question, index }) => {
      setIsThinking(false);
      setCurrentQuestion(question);
      setQuestionIndex(index);
      questionIndexRef.current = index;

      // Screen is cleared for writing next question answer
      setAnswerText('');
      answerTextRef.current = '';
      setCodeSnippet('');
      codeSnippetRef.current = '';
      setEvalResult(null);

      // Reset question timer to 60s
      questionSecondsLeftRef.current = QUESTION_TIME_LIMIT;
      setQuestionSecondsLeft(QUESTION_TIME_LIMIT);

      // AI speaks the question aloud
      speakText(question.questionText);
    });

    socketInstance.on('ai-evaluating', () => {
      setIsEvaluating(true);
    });

    socketInstance.on('answer-evaluated', ({ evaluation }) => {
      setIsEvaluating(false);
      setEvalResult(evaluation);
    });

    socketInstance.on('interview-complete', () => {
      handleFinishInterview();
    });

    socketInstance.on('session-finished', () => {
      navigate(`/interview/report/${sessionId}`);
    });

    setSocket(socketInstance);

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      socketInstance.disconnect();
    };
  }, [sessionId, token, navigate]);

  // 5. Core Transition: Automatically or Manually Advance to Next Question
  const advanceToNextQuestion = (isAutoTimeout = false) => {
    if (isTransitioningRef.current || isUploadingRecordingRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);

    // Stop candidate mic dictation
    stopVoiceAnswer();

    const currentAns = answerTextRef.current;
    const currentCode = codeSnippetRef.current;
    const currentIdx = questionIndexRef.current;

    // Background submit to record score in database
    if (socketRef.current) {
      socketRef.current.emit('submit-answer', {
        sessionId,
        questionIndex: currentIdx,
        answer: currentAns.trim() || (isAutoTimeout ? '[Auto-submitted at 1-minute time limit]' : ''),
        codeSnippet: currentCode
      });
    }

    // Check if Question 5 (index 4) was finished or total 5 minutes expired
    if (currentIdx >= 4 || totalSecondsElapsedRef.current >= TOTAL_INTERVIEW_LIMIT) {
      setAutoAdvanceNotice('5 Minutes Completed. Finalizing your interview scorecard...');
      speakText('Five minutes completed. Concluding your interview and compiling your final scorecard.', () => {
        handleFinishInterview();
      });
      setTimeout(() => {
        handleFinishInterview();
      }, 2200);
      return;
    }

    // Voice announcement: "Time is up for this question. Moving to next question."
    const announcement = isAutoTimeout
      ? 'Time is up for this question. Moving to next question.'
      : 'Moving to next question.';
    setAutoAdvanceNotice(announcement);
    speakText(announcement);

    // CLEAR SCREEN COMPLETELY FOR WRITING NEXT QUESTION'S ANSWER
    setAnswerText('');
    answerTextRef.current = '';
    setCodeSnippet('');
    codeSnippetRef.current = '';
    setEvalResult(null);
    setShowCodeEditor(false);

    // Reset 1-minute question countdown
    questionSecondsLeftRef.current = QUESTION_TIME_LIMIT;
    setQuestionSecondsLeft(QUESTION_TIME_LIMIT);

    // Minimize transition time: immediately request the next question!
    const nextIdx = currentIdx + 1;
    questionIndexRef.current = nextIdx;
    setQuestionIndex(nextIdx);

    if (socketRef.current) {
      socketRef.current.emit('get-question', { sessionId, questionIndex: nextIdx });
    }

    setTimeout(() => {
      setAutoAdvanceNotice('');
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }, 700);
  };

  // 6. Finish Interview and Upload 5-Minute Video Recording
  const handleFinishInterview = async () => {
    if (isUploadingRecordingRef.current) return;
    isUploadingRecordingRef.current = true;
    setIsUploadingRecording(true);

    stopVoiceAnswer();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Stop recorder and compile final chunks
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      await new Promise((resolve) => {
        recorder.onstop = () => resolve();
        try {
          recorder.stop();
        } catch (e) {
          resolve();
        }
      });
    }

    // Stop media tracks
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
    }

    // If recorded chunks exist, upload WebM to server
    const chunks = recordedChunksRef.current;
    if (chunks && chunks.length > 0) {
      try {
        const mimeType = recorder?.mimeType || 'video/webm';
        const videoBlob = new Blob(chunks, { type: mimeType });
        const formData = new FormData();
        formData.append('recording', videoBlob, `interview_${sessionId}.webm`);
        formData.append('durationSeconds', totalSecondsElapsedRef.current);

        await fetch(`/api/interviews/${sessionId}/recording`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
        setRecordingUploaded(true);
      } catch (err) {
        console.error('Failed to upload interview recording:', err);
      }
    }

    if (socketRef.current) {
      socketRef.current.emit('finish-session', {
        sessionId,
        durationSeconds: totalSecondsElapsedRef.current
      });
    } else {
      navigate(`/interview/report/${sessionId}`);
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative">
      
      {/* Uploading Recording Modal Overlay */}
      {isUploadingRecording && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-w-md w-full flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Saving Interview Video & Audio</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                We are securing your technical interview recording and generating your AI evaluation scorecard. This video will automatically be sent to recruiters when you apply for jobs!
              </p>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Floating Transition Notice Banner */}
      {autoAdvanceNotice && (
        <div className="p-3 rounded-2xl bg-brand-600/20 border border-brand-500/40 text-brand-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
          <FastForward className="w-4 h-4 text-brand-400 animate-pulse" />
          <span>{autoAdvanceNotice}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>{sessionData?.role || 'Technical Interview Room'}</span>
              <span className="text-[10px] uppercase font-semibold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                {sessionData?.difficulty || 'Mid'} Level
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                REC (Max 5 Mins)
              </span>
            </div>
            <div className="text-xs text-slate-400">1 Minute per Question • Total 5-Minute Technical Round</div>
          </div>
        </div>

        {/* Action Controls & Timers */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Question 1-Minute Countdown Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              questionSecondsLeft <= 10
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : questionSecondsLeft <= 20
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-emerald-400'
            }`}
            title="Time remaining for current question (1 minute auto-advance)"
          >
            <Hourglass className={`w-3.5 h-3.5 ${questionSecondsLeft <= 10 ? 'text-rose-400 animate-spin' : 'text-emerald-400'}`} />
            <span>Q{questionIndex + 1}: {formatTimer(questionSecondsLeft)}</span>
          </div>

          {/* Total 5-Minute Session Limit */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
            title="Total interview video duration (Max 5 minutes)"
          >
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>{formatTimer(totalSecondsElapsed)} / 05:00</span>
          </div>

          {/* Audio Output Toggle */}
          <button
            onClick={() => {
              if (speechEnabled && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setIsSpeakingAI(false);
              }
              setSpeechEnabled(!speechEnabled);
            }}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              speechEnabled
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
            title={speechEnabled ? 'Mute AI Voice' : 'Unmute AI Voice'}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4 text-brand-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{speechEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              cameraEnabled
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
            title={cameraEnabled ? 'Disable Camera' : 'Enable Camera'}
          >
            {cameraEnabled ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{cameraEnabled ? 'Webcam' : 'Off'}</span>
          </button>

          {/* End Early Button */}
          <button
            onClick={handleFinishInterview}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all whitespace-nowrap"
          >
            End Early
          </button>
        </div>
      </div>

      {/* Video & Interview Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Video Feeds + Clean Written Question & Input Area */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Two-Pane Video Interview Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. AI Interviewer Video Avatar Tile */}
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 p-4 flex flex-col items-center justify-between min-h-[220px] shadow-xl overflow-hidden group">
              <div className="w-full flex items-center justify-between text-[11px] text-slate-400 z-10">
                <span className="flex items-center gap-1 text-brand-400 font-semibold">
                  <Bot className="w-3.5 h-3.5" /> AI Interviewer
                </span>
                <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-[10px]">
                  Gemini 3.8 Live
                </span>
              </div>

              {/* Animated AI Speaking Visualizer */}
              <div className="relative my-4 flex flex-col items-center justify-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                    isSpeakingAI
                      ? 'bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 ring-8 ring-brand-500/20 scale-105 animate-pulse'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                >
                  <Bot className={`w-10 h-10 ${isSpeakingAI ? 'text-white' : 'text-slate-400'}`} />
                </div>

                {isSpeakingAI && (
                  <div className="mt-3 flex items-center gap-1">
                    <span className="w-1.5 h-4 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-6 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-3 bg-brand-400 rounded-full animate-bounce" />
                    <span className="text-[10px] text-brand-300 ml-1 font-semibold uppercase tracking-wider">Speaking Question...</span>
                  </div>
                )}
              </div>

              <div className="w-full flex items-center justify-between z-10 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400">Technical Lead AI</span>
                {currentQuestion && (
                  <button
                    onClick={() => speakText(currentQuestion.questionText)}
                    className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 font-semibold"
                    title="Play voice again"
                  >
                    <RefreshCw className="w-3 h-3" /> Re-speak
                  </button>
                )}
              </div>
            </div>

            {/* 2. Candidate Live Webcam Stream Tile */}
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 min-h-[220px] shadow-xl overflow-hidden flex flex-col items-center justify-center">
              
              {cameraEnabled ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-2xl transform -scale-x-100"
                  />

                  {/* Candidate Name Badge Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] text-emerald-400 font-semibold backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE CAMERA
                  </div>

                  {/* Recruiter Recording Active Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/85 border border-rose-500/40 text-[10px] text-rose-400 font-semibold backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    REC: VIDEO + AUDIO
                  </div>

                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-slate-950/80 text-[11px] font-bold text-white border border-slate-800 backdrop-blur-md">
                    {user?.name || 'Candidate'}
                  </div>
                </>
              ) : (
                <div className="p-4 text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div className="text-xs font-semibold text-slate-300">Camera is Turned Off</div>
                  <button
                    onClick={toggleCamera}
                    className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold shadow transition-all"
                  >
                    Turn On Webcam
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Written Question Card with 1-Minute Progress Bar */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Question {questionIndex + 1} of 5 • {currentQuestion?.category || sessionData?.role || 'Domain Technical Round'}
              </span>

              {/* 5-Step Question Progress Pills */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {[0, 1, 2, 3, 4].map((idx) => {
                  const isCurrent = idx === questionIndex;
                  const isDone = idx < questionIndex;
                  return (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        isCurrent
                          ? 'w-7 bg-brand-500 ring-2 ring-brand-500/30'
                          : isDone
                          ? 'w-5 bg-emerald-500'
                          : 'w-4 bg-slate-800'
                      }`}
                      title={`Question ${idx + 1} of 5`}
                    />
                  );
                })}
                <span className="text-[10px] text-slate-400 font-mono ml-1 font-semibold">
                  {questionIndex + 1}/5
                </span>
              </div>
            </div>

            {/* 1-Minute Question Countdown Linear Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  questionSecondsLeft <= 10
                    ? 'bg-rose-500'
                    : questionSecondsLeft <= 20
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${(questionSecondsLeft / QUESTION_TIME_LIMIT) * 100}%` }}
              />
            </div>

            {isThinking ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-2">
                <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-400 animate-pulse">
                  AI Interviewer is formulating question {questionIndex + 1} of 5...
                </span>
              </div>
            ) : (
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQuestion?.questionText || 'Connecting to AI interview room...'}
                </h2>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between gap-2 flex-wrap">
                  <span>💡 Listen to AI voice or dictate/type your answer below.</span>
                  <span className={`font-mono text-xs ${questionSecondsLeft <= 10 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'}`}>
                    ⏱️ Auto-moves in {questionSecondsLeft}s
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Clean Screen for Candidate Answer (Cleared on every question) */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Your Response for Question #{questionIndex + 1} (Speak or Type)
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Screen clears automatically as you advance. Finish early anytime to load the next question instantly.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Answer Dictate Button */}
                <button
                  type="button"
                  onClick={voiceAnswerActive ? stopVoiceAnswer : startVoiceAnswer}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    voiceAnswerActive
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse ring-4 ring-red-500/20 shadow-red-500/30'
                      : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30'
                  }`}
                >
                  {voiceAnswerActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{voiceAnswerActive ? 'Stop Mic' : '🎙️ Speak Answer'}</span>
                </button>

                {/* Code Scratchpad Button */}
                <button
                  type="button"
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    showCodeEditor
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Code Scratchpad
                </button>
              </div>
            </div>

            {/* Voice Active Indicator Banner */}
            {voiceAnswerActive && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-300 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-semibold">Microphone Live: Speak your answer clearly into your mic...</span>
                </div>
                <button
                  onClick={stopVoiceAnswer}
                  className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold"
                >
                  Done Speaking
                </button>
              </div>
            )}

            {/* Answer Text Area (Clean on every question) */}
            <textarea
              rows={5}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Your voice transcription will appear here automatically as you speak, or type directly..."
              disabled={isTransitioning}
              className="w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-white text-xs outline-none focus:border-brand-500 leading-relaxed font-sans placeholder-slate-500"
            />

            {/* Code Scratchpad Area */}
            {showCodeEditor && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Code / Implementation Scratchpad</span>
                  <span>Optional JavaScript / Python / Pseudo</span>
                </div>
                <textarea
                  rows={6}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="// Optional: write algorithm logic or code snippets to demonstrate implementation depth..."
                  disabled={isTransitioning}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-300 text-xs font-mono outline-none focus:border-brand-500 leading-relaxed"
                />
              </div>
            )}

            {/* Submit & Next Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>Words: {answerText.split(/\s+/).filter(Boolean).length}</span>
                <span>•</span>
                <span className={`font-mono ${questionSecondsLeft <= 10 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'}`}>
                  Auto-advancing in {questionSecondsLeft}s
                </span>
              </div>

              {/* Fast 1-Click Advance Button (Minimizes Transition Time) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => advanceToNextQuestion(false)}
                  disabled={isTransitioning || isUploadingRecording}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                    questionIndex >= 4
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-[1.02]'
                      : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30 hover:scale-[1.02]'
                  }`}
                >
                  {questionIndex >= 4 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit & Finish Interview (5/5)
                    </>
                  ) : (
                    <>
                      <span>Submit & Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right 5 Cols: Real-Time Gemini Rubric & 5-Minute Session Monitor */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-5 sticky top-24">
            
            {/* Session Monitor Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-400" />
                Live 5-Minute Session Pace
              </span>
              <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                {formatTimer(totalSecondsElapsed)} / 05:00
              </span>
            </div>

            {/* Quick 5-Question Session Map */}
            <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
              {[0, 1, 2, 3, 4].map((idx) => {
                const isCurrent = idx === questionIndex;
                const isDone = idx < questionIndex;
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-brand-500/20 border-brand-500 text-white font-bold ring-2 ring-brand-500/30'
                        : isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-800/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div>Q{idx + 1}</div>
                    <div className="text-[9px] mt-0.5 font-sans">
                      {isCurrent ? `${questionSecondsLeft}s` : isDone ? 'Done' : '1 min'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rubric Feedback Card */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  Gemini Evaluation Feed
                </span>
                {evalResult && (
                  <span className="text-lg font-black text-white">
                    {evalResult.score}<span className="text-xs text-slate-500 font-normal">/100</span>
                  </span>
                )}
              </div>

              {isEvaluating ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h4 className="text-xs font-bold text-white">Analyzing Answer Quality</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Gemini AI is assessing your technical depth and architectural reasoning...
                  </p>
                </div>
              ) : !evalResult ? (
                <div className="py-8 text-center space-y-2">
                  <Bot className="w-10 h-10 text-slate-700 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-300">Fast Transition Enabled</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Speak or write your answer. When you finish or when the 1-minute countdown reaches zero, the system seamlessly moves to the next question with a cleared screen.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in zoom-in-95 text-xs">
                  {/* Score Meters */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">Accuracy</span>
                      <span className="text-sm font-bold text-emerald-400">{evalResult.accuracy}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">Depth</span>
                      <span className="text-sm font-bold text-brand-400">{evalResult.depth}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">Clarity</span>
                      <span className="text-sm font-bold text-purple-400">{evalResult.clarity}%</span>
                    </div>
                  </div>

                  {/* Strengths */}
                  {evalResult.strengths && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-200 space-y-1">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">{evalResult.strengths}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {evalResult.improvements && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-200 space-y-1">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5" /> Key Advice
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">{evalResult.improvements}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default LiveInterview;
