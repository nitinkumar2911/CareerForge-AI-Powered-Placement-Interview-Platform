const jwt = require('jsonwebtoken');
const InterviewSession = require('../models/InterviewSession');
const {
  generateInterviewQuestion,
  evaluateInterviewAnswer,
  generateOverallFeedback
} = require('../services/aiInterviewService');

const registerInterviewSocket = (io) => {
  const interviewNamespace = io.of('/interview');

  // Socket middleware for authentication
  interviewNamespace.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'careerforge_super_secret_jwt_token_2026_xyz!'
      );
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Invalid socket authentication token'));
    }
  });

  interviewNamespace.on('connection', (socket) => {
    console.log(`User connected to interview socket: ${socket.userId} (${socket.id})`);

    // Join a specific interview session room
    socket.on('join-session', async ({ sessionId }) => {
      try {
        const session = await InterviewSession.findById(sessionId);
        if (!session) {
          return socket.emit('error-message', { message: 'Interview session not found' });
        }

        socket.join(sessionId);
        console.log(`Socket ${socket.id} joined session ${sessionId}`);

        socket.emit('session-joined', {
          sessionId,
          role: session.role,
          difficulty: session.difficulty,
          status: session.status,
          questionsCount: session.questions.length,
          questions: session.questions
        });
      } catch (err) {
        socket.emit('error-message', { message: err.message });
      }
    });

    // Request the next question (strictly capped at 5 questions: indices 0 to 4)
    socket.on('get-question', async ({ sessionId, questionIndex = 0 }) => {
      try {
        const session = await InterviewSession.findById(sessionId);
        if (!session) return socket.emit('error-message', { message: 'Session not found' });

        // Enforce exactly 5 questions per interview session
        if (questionIndex >= 5) {
          return socket.emit('interview-complete', {
            sessionId,
            message: 'All 5 technical questions completed. Please proceed to generate your final scorecard.'
          });
        }

        // If question already exists at this index, return it
        if (session.questions[questionIndex]) {
          return socket.emit('question-received', {
            question: session.questions[questionIndex],
            index: questionIndex
          });
        }

        // Generate dynamic question
        socket.emit('ai-thinking', { message: 'AI Interviewer is preparing your next question...' });
        const questionData = await generateInterviewQuestion(
          session.role,
          session.difficulty,
          questionIndex,
          session.questions
        );

        const newQuestion = {
          questionIndex,
          questionText: questionData.questionText,
          category: questionData.category,
          expectedKeywords: questionData.expectedKeywords,
          evaluation: {
            modelAnswer: questionData.modelAnswer
          }
        };

        session.questions.push(newQuestion);
        await session.save();

        interviewNamespace.to(sessionId).emit('question-received', {
          question: newQuestion,
          index: questionIndex
        });
      } catch (err) {
        console.error('Error fetching question:', err);
        socket.emit('error-message', { message: 'Failed to generate question.' });
      }
    });

    // Submit answer and receive real-time AI evaluation
    socket.on('submit-answer', async ({ sessionId, questionIndex, answer, codeSnippet }) => {
      try {
        const session = await InterviewSession.findById(sessionId);
        if (!session) return socket.emit('error-message', { message: 'Session not found' });

        const q = session.questions.find(item => item.questionIndex === questionIndex);
        if (!q) return socket.emit('error-message', { message: 'Question not found in session' });

        socket.emit('ai-evaluating', { message: 'AI is evaluating your technical accuracy, depth, and clarity...' });

        const evaluation = await evaluateInterviewAnswer(
          q.questionText,
          q.expectedKeywords,
          answer,
          codeSnippet,
          session.difficulty
        );

        q.candidateAnswer = answer;
        q.codeSnippet = codeSnippet || '';
        q.answeredAt = new Date();
        q.evaluation = {
          score: evaluation.score,
          accuracy: evaluation.accuracy,
          clarity: evaluation.clarity,
          depth: evaluation.depth,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          modelAnswer: evaluation.modelAnswer || q.evaluation?.modelAnswer || ''
        };

        await session.save();

        interviewNamespace.to(sessionId).emit('answer-evaluated', {
          questionIndex,
          evaluation: q.evaluation,
          candidateAnswer: answer,
          isLastQuestion: questionIndex >= 4,
          totalQuestions: 5
        });
      } catch (err) {
        console.error('Error evaluating answer:', err);
        socket.emit('error-message', { message: 'Evaluation failed.' });
      }
    });

    // Complete interview session and generate final scorecard
    socket.on('finish-session', async ({ sessionId, durationSeconds }) => {
      try {
        const session = await InterviewSession.findById(sessionId);
        if (!session) return socket.emit('error-message', { message: 'Session not found' });

        const feedback = generateOverallFeedback(session.questions);

        session.status = 'completed';
        session.totalScore = feedback.totalScore;
        session.overallFeedback = feedback.overallFeedback;
        session.topStrengths = feedback.topStrengths;
        session.keyRecommendations = feedback.keyRecommendations;
        if (durationSeconds) session.durationSeconds = durationSeconds;

        await session.save();

        interviewNamespace.to(sessionId).emit('session-finished', {
          sessionId,
          totalScore: session.totalScore,
          overallFeedback: session.overallFeedback,
          topStrengths: session.topStrengths,
          keyRecommendations: session.keyRecommendations,
          questions: session.questions
        });
      } catch (err) {
        console.error('Error completing session:', err);
        socket.emit('error-message', { message: 'Failed to finish session.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected from interview socket: ${socket.id}`);
    });
  });
};

module.exports = registerInterviewSocket;
