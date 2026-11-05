/**
 * CareerForge AI Interviewer Service
 * Integrates with Google Gemini API when GEMINI_API_KEY is present,
 * and seamlessly provides high-fidelity intelligent simulated evaluations when offline.
 */

const ROLE_QUESTION_BANKS = {
  'Full Stack Developer': [
    {
      category: 'Full-Stack Architecture & API Design',
      questionText: 'How do you design a resilient, RESTful API and WebSocket system that seamlessly handles live user sessions and authentication state synchronization?',
      expectedKeywords: ['jwt', 'socket.io', 'handshake', 'middleware', 'stateless', 'cors', 'auth header'],
      modelAnswer: 'A resilient full-stack system leverages stateless JWT authentication. For REST endpoints, Express auth middleware validates the Authorization header Bearer token. For WebSockets (Socket.io), tokens are authenticated during the initial HTTP handshake middleware. Custom frontend React hooks manage automatic token refresh and transparent reconnection when network drops occur, syncing state between REST caches and live socket events.'
    },
    {
      category: 'Database & ORM Integration',
      questionText: 'Compare SQL (PostgreSQL) vs NoSQL (MongoDB) for full-stack applications. How do you handle schema migrations and relation modeling in each?',
      expectedKeywords: ['postgresql', 'mongodb', 'acid', 'joins', 'schema migration', 'embedding vs referencing', 'indexing'],
      modelAnswer: 'PostgreSQL provides strict ACID guarantees, normalized relational modeling with JOINs, and explicit schema migrations using tools like Prisma or Knex. MongoDB offers flexible document modeling optimal for evolving schemas and hierarchical data, choosing between embedding (for 1:few tightly coupled data) and referencing with ObjectId (for 1:many unbounded relations). Relational DBs excel in transactional integrity, while NoSQL offers rapid prototyping and horizontal scaling.'
    },
    {
      category: 'State Management & Web Performance',
      questionText: 'How do you optimize state management and rendering performance in a modern React + Node stack? Discuss SSR vs CSR and hydration trade-offs.',
      expectedKeywords: ['ssr', 'csr', 'hydration', 'react.memo', 'code splitting', 'bundle size', 'zustand'],
      modelAnswer: 'Client-Side Rendering (CSR) downloads a minimal HTML shell and runs JavaScript to render, creating longer initial load times. Server-Side Rendering (SSR with Next.js) renders HTML on the server for faster First Contentful Paint and superior SEO, but requires client hydration where event listeners attach. Performance is optimized via route-based dynamic code-splitting, selective hydration, colocating state, and selector-based state stores like Zustand.'
    },
    {
      category: 'Security & Data Integrity',
      questionText: 'What is SQL/NoSQL injection, and how do you protect full-stack MERN/Node applications against injection attacks, rate limiting abuses, and data leaks?',
      expectedKeywords: ['injection', 'express-rate-limit', 'helmet', 'mongoose schema', 'input validation', 'sanitization'],
      modelAnswer: 'NoSQL injection happens when unvalidated user objects (like {$gt: ""}) bypass query logic. Protection involves strict Mongoose schema typing, using validator/Zod for request body validation, and sanitizing inputs. Rate limiting via express-rate-limit and Redis prevents brute-force attacks. Setting Helmet.js headers, disabling X-Powered-By, enforcing CORS origins, and using environment variables for all secrets ensures robust defense in depth.'
    },
    {
      category: 'System Design & Scalability Scenario',
      questionText: 'Walk me through designing an end-to-end URL shortening service (like Bitly) handling 100 million daily clicks. Cover database schema, hashing/encoding, and scaling.',
      expectedKeywords: ['base62', 'hashing', 'uuid', 'cache', 'redis', 'load balancer', 'nosql', 'sharding'],
      modelAnswer: 'Design includes an API Gateway behind a Load Balancer, distributed Redis caching, and a NoSQL or partitioned SQL database storing (shortCode, originalUrl, userId, createdAt, clicks). Generate short URLs by base62-encoding an auto-incrementing 64-bit ID or counter (ZooKeeper/Snowflake) to guarantee 7-character collision-free codes. Caching popular URLs in Redis achieves sub-millisecond response times. Read heavy (100:1 ratio) architecture scales by deploying read replicas and geo-distributed CDN edge redirects.'
    }
  ],

  'Frontend Developer': [
    {
      category: 'React & Core Architecture',
      questionText: 'Can you explain the Virtual DOM in React, how the reconciliation algorithm works, and how React 18 Concurrent features improve UI responsiveness?',
      expectedKeywords: ['virtual dom', 'diffing', 'reconciliation', 'fiber', 'concurrent', 'useTransition', 'batching'],
      modelAnswer: 'React maintains an in-memory representation of UI known as the Virtual DOM. When state changes occur, React creates a new VDOM tree, runs a diffing algorithm against the previous tree (reconciling changes in O(n) time using heuristic rules like unique keys), and flushes minimal DOM mutations. In React 18, the Concurrent renderer enables interruptible rendering via fibers, allowing urgent interactions (typing, clicking) to preempt heavy secondary renders using hooks like useTransition and automatic batching.'
    },
    {
      category: 'State Management & Component Architecture',
      questionText: 'How do you prevent unnecessary re-renders in a large-scale React component tree? Contrast React.memo, useMemo, and useCallback with practical scenarios.',
      expectedKeywords: ['react.memo', 'usememo', 'usecallback', 'props reference', 'shallow comparison', 're-renders'],
      modelAnswer: 'Unnecessary re-renders occur when parent re-renders cause child components to re-render despite unchanged data. React.memo performs a shallow equality check on component props. useCallback memoizes function definitions to avoid recreating function references passed as props across renders. useMemo caches expensive computational results. To optimize further, colocate state close to where it is used, extract complex state into context with modular providers, or use selector-based state stores like Zustand or Redux Toolkit.'
    },
    {
      category: 'Web Performance & Core Web Vitals',
      questionText: 'Explain Core Web Vitals (LCP, INP, CLS) and provide three concrete techniques you would implement to diagnose and optimize a slow-loading web application.',
      expectedKeywords: ['lcp', 'inp', 'cls', 'core web vitals', 'code splitting', 'lazy loading', 'critical css', 'bundle size'],
      modelAnswer: 'Core Web Vitals measure real-world user experience: Largest Contentful Paint (LCP) measures loading speed, Interaction to Next Paint (INP) measures responsiveness, and Cumulative Layout Shift (CLS) measures visual stability. To optimize: 1) Implement route-based and component-level code splitting with React.lazy and dynamic imports; 2) Optimize hero assets with responsive modern image formats (AVIF/WebP) and fetchpriority="high"; 3) Prevent CLS by always setting explicit width/height dimensions or aspect-ratio CSS on images and dynamic containers.'
    },
    {
      category: 'Security & Asynchronous State',
      questionText: 'How do you safeguard a React Single Page Application against XSS and CSRF attacks when handling authentication tokens and user inputs?',
      expectedKeywords: ['xss', 'csrf', 'httponly', 'jwt', 'sanitization', 'dangerouslysetinnerhtml', 'cors'],
      modelAnswer: 'To defend against XSS, avoid dangerouslySetInnerHTML and sanitize any user-generated markdown using DOMPurify. Store authentication tokens in secure, HttpOnly, SameSite=Strict cookies rather than localStorage where malicious scripts could extract them. To protect against CSRF when using cookies, incorporate anti-CSRF tokens or verify Origin and Referer headers. Always implement strict Content Security Policy (CSP) headers on the server.'
    },
    {
      category: 'Micro-frontends & Design Systems',
      questionText: 'How do you design a shared design system or micro-frontend architecture across multiple enterprise development teams?',
      expectedKeywords: ['design tokens', 'module federation', 'storybook', 'micro-frontends', 'versioning', 'accessibility', 'wcag'],
      modelAnswer: 'Enterprise design systems establish atomic components documented in Storybook with centralized design tokens (colors, typography, spacing) distributed via npm. For micro-frontends, Webpack Module Federation or Vite dynamic federation allows runtime loading of independent remotes without rebuilding the shell host. Shared dependencies (like React) are declared as singletons to prevent multiple runtime instances.'
    }
  ],

  'Backend Engineer': [
    {
      category: 'Node.js Event Loop & Concurrency',
      questionText: 'Explain the internal architecture of Node.js, the phases of the libuv event loop, and how Node processes asynchronous I/O versus CPU-intensive workloads.',
      expectedKeywords: ['event loop', 'libuv', 'timers', 'poll', 'check', 'microtask', 'process.nexttick', 'worker threads', 'cluster'],
      modelAnswer: 'Node.js utilizes a single-threaded V8 engine backed by libuv for asynchronous I/O. The event loop traverses specific phases: Timers (setTimeout/setInterval), Pending I/O callbacks, Idle/Prepare, Poll (retrieves new I/O events), Check (setImmediate), and Close callbacks. Microtasks (process.nextTick and resolved Promise callbacks) execute immediately after each phase or call stack exhaustion. For CPU-bound tasks, Node offloads work via the Worker Threads module or splits traffic across CPU cores with the Cluster module to avoid blocking the event loop.'
    },
    {
      category: 'Database Design & Indexing',
      questionText: 'In MongoDB or relational databases, what happens under the hood when you index a collection? What are compound indexes and index intersection trade-offs?',
      expectedKeywords: ['b-tree', 'index', 'compound index', 'esr rule', 'write amplification', 'explain plan', 'scan'],
      modelAnswer: 'Indexes create balanced B-Tree (or WiredTiger B-tree) data structures referencing document positions, eliminating full collection scans (COLLSCAN). Compound indexes index multiple fields following the ESR (Equality, Sort, Range) rule. The trade-off is write amplification: every insert, update, or delete requires updating every associated index and increases memory (RAM) usage. Using db.collection.explain("executionStats") allows verification of index efficiency (keysExamined vs docsReturned).'
    },
    {
      category: 'Scalability & Caching Architecture',
      questionText: 'Describe how you would design a distributed caching layer using Redis. How do you handle Cache Invalidation, Cache Stampede, and Cache Penetration?',
      expectedKeywords: ['redis', 'cache invalidation', 'cache stampede', 'cache penetration', 'bloom filter', 'mutex lock', 'ttl'],
      modelAnswer: 'A distributed cache like Redis sits in front of the database using Cache-Aside (Lazy Loading) or Write-Through patterns. For Cache Penetration (queries for non-existent keys), store null with short TTL or use a Bloom Filter. For Cache Stampede (mass concurrent queries on expired keys), utilize distributed mutex locks (Redlock) or background probabilistic early refresh (XFetch). For Cache Invalidation, apply event-driven cache purges upon write events and establish sensible TTL boundaries.'
    },
    {
      category: 'Microservices & Message Queues',
      questionText: 'Compare REST, WebSockets, and Message Queues (e.g. RabbitMQ/Kafka) for inter-service communication. When would you use event-driven architecture?',
      expectedKeywords: ['rest', 'websockets', 'kafka', 'rabbitmq', 'event-driven', 'decoupling', 'pub/sub', 'idempotency'],
      modelAnswer: 'REST is synchronous request-response, ideal for simple client-to-server operations. WebSockets provide low-latency bidirectional real-time communication suitable for chat, live trackers, and real-time feeds. Message queues (Kafka/RabbitMQ) enable asynchronous, decoupled, fault-tolerant event-driven workflows with guaranteed delivery and load leveling. Event-driven architecture is optimal for distributed order processing, notification pipelines, and heavy asynchronous background tasks, requiring idempotent consumer handlers to handle retries.'
    },
    {
      category: 'Distributed Transactions & Resilience',
      questionText: 'How do you maintain data consistency across distributed microservices without distributed two-phase commits? Explain the Saga pattern and idempotency.',
      expectedKeywords: ['saga pattern', 'choreography', 'orchestration', 'compensating transactions', 'idempotency key', 'outbox pattern'],
      modelAnswer: 'The Saga pattern breaks distributed transactions into a sequence of local transactions. Each transaction updates its local database and publishes an event/message triggering the next step. If a step fails, compensating transactions execute in reverse order to rollback state. Sagas can be choreographed (event-driven) or orchestrated (central coordinator). To prevent duplicate processing during retries, consumers enforce idempotency via unique transaction idempotency keys and transactional outbox patterns.'
    }
  ],

  'Data Scientist & Machine Learning': [
    {
      category: 'Machine Learning Foundations',
      questionText: 'Explain the bias-variance tradeoff and how you diagnose overfitting versus underfitting using learning curves and cross-validation.',
      expectedKeywords: ['bias', 'variance', 'overfitting', 'underfitting', 'regularization', 'cross-validation', 'k-fold'],
      modelAnswer: 'Bias refers to error from erroneous assumptions in the learning algorithm (underfitting), while variance refers to sensitivity to small fluctuations in training data (overfitting). High bias displays low training and test accuracy. High variance shows near-perfect training accuracy with poor validation accuracy. Remediation includes L1/L2 regularization, k-fold cross-validation, dropout, feature selection, or collecting more training samples.'
    },
    {
      category: 'Feature Engineering & Data Preprocessing',
      questionText: 'How do you handle missing data, high cardinality categorical features, and severe class imbalance in real-world machine learning datasets?',
      expectedKeywords: ['imputation', 'target encoding', 'smote', 'f1 score', 'class weights', 'one-hot encoding'],
      modelAnswer: 'Missing data is addressed via domain imputation, median/mode, or KNN/IterativeImputer. For high-cardinality categories, one-hot encoding causes curse of dimensionality; target encoding with smoothing, frequency encoding, or embeddings are superior. For class imbalance, resampling techniques like SMOTE (synthetic minority oversampling) or adjusting loss class weights (e.g., class_weight="balanced") are applied, evaluating models with Precision-Recall AUC and F1-score rather than accuracy.'
    },
    {
      category: 'Model Evaluation & Optimization',
      questionText: 'Compare Precision, Recall, F1-Score, and ROC-AUC. In a fraud detection scenario, which metric would you prioritize and why?',
      expectedKeywords: ['precision', 'recall', 'f1-score', 'roc-auc', 'false positives', 'false negatives', 'fraud detection'],
      modelAnswer: 'Precision is TP/(TP+FP), measuring exactness. Recall is TP/(TP+FN), measuring completeness. F1 is the harmonic mean of precision and recall. ROC-AUC measures discrimination capability across all classification thresholds. In fraud detection, missing a fraudulent transaction (False Negative) is catastrophic compared to flagging a legitimate transaction for 2FA review (False Positive). Therefore, we maximize Recall while setting a threshold that maintains acceptable Precision.'
    },
    {
      category: 'Deep Learning & Neural Networks',
      questionText: 'Explain the vanishing/exploding gradient problem in deep neural networks and how modern architectures (ResNet, Transformers) and techniques mitigate it.',
      expectedKeywords: ['vanishing gradient', 'exploding gradient', 'residual connections', 'batch normalization', 'relu', 'adam', 'attention'],
      modelAnswer: 'During backpropagation, gradients calculated via the chain rule multiply continuously across layers; if derivatives are < 1, gradients vanish to zero (halting weight updates); if > 1, they explode. Solutions include non-saturating activation functions (ReLU, GELU), Batch/Layer Normalization, gradient clipping, He/Xavier weight initialization, and Residual Connections (skip connections in ResNet/Transformers) that allow gradients to flow directly through the identity mapping.'
    },
    {
      category: 'MLOps & Model Lifecycle',
      questionText: 'What is data drift and concept drift in production ML models? How do you monitor, detect, and set up automated model retraining pipelines?',
      expectedKeywords: ['data drift', 'concept drift', 'evidently ai', 'kolmogorov-smirnov', 'retraining', 'pipeline', 'mlflow'],
      modelAnswer: 'Data drift (covariate shift) occurs when input feature distributions change over time (e.g., shifting user demographics). Concept drift occurs when the statistical relationship between features and target labels changes (e.g., consumer behavior changes during a pandemic). Detection employs statistical tests like Kolmogorov-Smirnov (KS-test) or Population Stability Index (PSI). Production monitoring with tools like Evidently AI/Prometheus triggers automated retraining pipelines managed in MLflow or Kubeflow.'
    }
  ],

  'AI / LLM Engineer': [
    {
      category: 'Transformer Architecture & Self-Attention',
      questionText: 'Explain the internal mechanics of the Self-Attention mechanism in the Transformer architecture. What is the mathematical role of Query, Key, and Value matrices?',
      expectedKeywords: ['self-attention', 'query key value', 'softmax', 'scaling factor', 'transformer', 'embeddings', 'multi-head attention'],
      modelAnswer: 'Self-attention computes dynamic contextual representations of tokens. Input embeddings are projected via learned weight matrices into Query (Q), Key (K), and Value (V) representations. Attention weights are computed by calculating the dot product of Q and K^T, scaled by the square root of dimension d_k to prevent gradient vanishing, passed through Softmax to create a probability distribution, and multiplied by V. Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.'
    },
    {
      category: 'Retrieval Augmented Generation (RAG)',
      questionText: 'Walk me through designing an enterprise RAG (Retrieval Augmented Generation) pipeline. How do you optimize chunking strategies, embedding models, and hybrid retrieval?',
      expectedKeywords: ['rag', 'chunking', 'embedding', 'vector database', 'hybrid search', 'bm25', 'reranking', 'cross-encoder'],
      modelAnswer: 'An enterprise RAG pipeline ingests documents, parses metadata, and splits text using recursive character or semantic chunking with overlapping windows. Chunks are embedded into vector spaces. At query time, Hybrid Search combines dense semantic vector similarity with sparse lexical matching (BM25) to capture both semantic intent and exact keywords. Top candidates are passed through a Cross-Encoder Reranker before being injected into the LLM system prompt context window.'
    },
    {
      category: 'Vector Databases & Similarity Search',
      questionText: 'How do Vector Databases perform lightning-fast similarity search over millions of high-dimensional vectors? Compare HNSW with IVF indexes.',
      expectedKeywords: ['hnsw', 'ivf', 'cosine similarity', 'ann', 'approximate nearest neighbor', 'vector database', 'pinecone', 'milvus'],
      modelAnswer: 'Exact nearest neighbor (k-NN) requires brute-force O(N) distance calculations, which is too slow at scale. Vector databases use Approximate Nearest Neighbor (ANN) indexing. HNSW (Hierarchical Navigable Small World) constructs multi-layer graphs where top layers have long links for fast skipping and bottom layers provide fine-grained search, delivering logarithmic search complexity with high recall. Inverted File Index (IVF) clusters vectors using Voronoi cells and searches only nearest centroids, offering lower memory footprints but slightly lower recall.'
    },
    {
      category: 'Prompt Engineering vs Fine-Tuning (LoRA)',
      questionText: 'When would you choose Prompt Engineering / Few-Shot prompting versus Parameter-Efficient Fine-Tuning (PEFT / LoRA)? Explain how LoRA works.',
      expectedKeywords: ['lora', 'peft', 'prompt engineering', 'low-rank adaptation', 'fine-tuning', 'rank', 'weights'],
      modelAnswer: 'Prompt engineering and RAG are preferred when integrating dynamic external knowledge, rapid iteration, and off-the-shelf general models without training costs. Fine-tuning with LoRA (Low-Rank Adaptation) is chosen when modifying model style, vocabulary, specialized reasoning tasks, or strict domain output formatting. LoRA freezes pre-trained model weights W_0 and injects trainable rank decomposition matrices (A and B of dimension d x r and r x k, where r << d), reducing trainable parameters by 99% without latency overhead.'
    },
    {
      category: 'Hallucination Mitigation & Guardrails',
      questionText: 'How do you detect, mitigate, and benchmark LLM hallucinations in mission-critical applications? Discuss Guardrails and automated evaluation (Ragas / G-Eval).',
      expectedKeywords: ['hallucination', 'guardrails', 'ragas', 'faithfulness', 'answer relevance', 'grounding', 'structured output'],
      modelAnswer: 'Hallucination mitigation starts with system prompt grounding: strictly instructing the LLM to reply only from provided context and state when information is unavailable. Guardrail frameworks (NeMo Guardrails, Guardrails AI) enforce PII filtering, topical rails, and JSON schema constraints. Automated evaluation pipelines use frameworks like Ragas or G-Eval to quantify Faithfulness (factual overlap with retrieved context), Answer Relevance, and Context Recall.'
    }
  ],

  'DevOps & Cloud Engineer': [
    {
      category: 'Containerization & Docker Internals',
      questionText: 'Explain the internal architecture of Docker. How do Linux namespaces, cgroups, and layered Union File Systems (overlay2) create container isolation?',
      expectedKeywords: ['namespaces', 'cgroups', 'overlay2', 'union filesystem', 'docker', 'isolation', 'containerd'],
      modelAnswer: 'Docker containers are isolated Linux processes, not virtual machines. Linux Namespaces provide process isolation (PID, NET, MNT, IPC, UTS, USER) ensuring a container cannot see host resources. Control Groups (cgroups) meter and restrict hardware consumption (CPU, RAM, I/O). The storage layer uses copy-on-write Union File Systems like overlay2, stacking immutable read-only image layers under a thin writable container layer, optimizing disk space and container startup speed.'
    },
    {
      category: 'Kubernetes Architecture & Orchestration',
      questionText: 'Describe the core components of the Kubernetes Control Plane and Worker Nodes. How does Kubernetes handle self-healing and rolling updates?',
      expectedKeywords: ['kube-apiserver', 'etcd', 'kube-scheduler', 'kube-controller-manager', 'kubelet', 'kube-proxy', 'rolling update'],
      modelAnswer: 'The Control Plane comprises kube-apiserver (central management REST endpoint), etcd (distributed key-value store for cluster state), kube-scheduler (assigns pods to worker nodes), and kube-controller-manager (runs controllers like Node and Deployment controllers). Worker nodes run kubelet (enforces pod specs) and kube-proxy (network packet forwarding). Self-healing operates via reconciliation loops: if a pod crashes, the ReplicaSet controller detects the drift and schedules a replacement.'
    },
    {
      category: 'CI/CD Pipelines & Deployment Strategies',
      questionText: 'Compare Blue-Green Deployments, Canary Deployments, and Rolling Updates. How do you design a zero-downtime CI/CD pipeline using GitHub Actions / GitLab CI?',
      expectedKeywords: ['blue-green', 'canary', 'rolling update', 'zero-downtime', 'github actions', 'rollback', 'traffic routing'],
      modelAnswer: 'Rolling updates gradually replace old pod replicas with new ones; it is resource efficient but serves mixed versions during transitions. Blue-Green maintains two identical production environments (Blue active, Green staged); once validated, the router/load balancer cuts 100% traffic to Green instantly, enabling immediate rollback. Canary routes a small percentage (5-10%) of traffic to the new version to monitor error rates and latency before full rollout. Pipelines automate linting, unit tests, container builds, and deployment gates.'
    },
    {
      category: 'Infrastructure as Code (Terraform)',
      questionText: 'How does Terraform manage cloud infrastructure state? Explain state locking, drift detection, and modular architecture best practices.',
      expectedKeywords: ['terraform', 'terraform state', 'state locking', 'dynamodb', 's3 backend', 'drift detection', 'modules'],
      modelAnswer: 'Terraform records infrastructure mappings in a state file (terraform.tfstate). In team environments, remote state backends (e.g. AWS S3 with DynamoDB state locking) prevent concurrent execution collisions. Drift detection (terraform plan) compares real-world cloud APIs against the local state file and declared HCL code. Best practices include separating environments (dev/stage/prod) into separate state files and building reusable, version-pinned modules.'
    },
    {
      category: 'Observability & Incident Management',
      questionText: 'Explain the Three Pillars of Observability (Metrics, Logs, Traces). How would you architect an observability stack using Prometheus, Grafana, and OpenTelemetry?',
      expectedKeywords: ['metrics', 'logs', 'traces', 'prometheus', 'grafana', 'opentelemetry', 'distributed tracing', 'alertmanager'],
      modelAnswer: 'Metrics represent aggregated numerical counters/gauges over time (Prometheus). Logs provide timestamped contextual events. Traces track request lifecycles across distributed microservices using unique Trace and Span IDs. OpenTelemetry provides a vendor-neutral SDK for instrumentation. Services push traces and metrics to an OTel Collector, which routes metrics to Prometheus and traces to Jaeger. Grafana unifies dashboards with Alertmanager sending real-time PagerDuty/Slack alerts.'
    }
  ],

  'Mobile App Developer': [
    {
      category: 'Mobile Runtime & Native Bridge',
      questionText: 'Explain how React Native works under the hood. Contrast the legacy JavaScript Bridge with the New Architecture (Fabric and TurboModules via JSI).',
      expectedKeywords: ['react native', 'bridge', 'jsi', 'fabric', 'turbomodules', 'hermes', 'c++'],
      modelAnswer: 'The legacy React Native architecture used an asynchronous, serialized JSON bridge across three threads (JS, Native, Shadow), creating serialization bottlenecks for high-frequency events. The New Architecture uses JavaScript Interface (JSI), allowing JavaScript to hold direct C++ references to native objects without serialization. Fabric provides a concurrent native rendering engine, and TurboModules enable lazy-loading of native modules on-demand, dramatically improving startup time and responsiveness.'
    },
    {
      category: 'Mobile Lifecycle & Offline Sync',
      questionText: 'How do you design an offline-first mobile application that gracefully handles intermittent network connectivity and syncs local data with a remote server?',
      expectedKeywords: ['offline-first', 'sqlite', 'watermelondb', 'realm', 'conflict resolution', 'background sync', 'last-write-wins'],
      modelAnswer: 'An offline-first app uses a fast local database (SQLite, WatermelonDB, or MMKV for key-value). All user actions commit locally first for zero-latency UI updates. A persistent sync queue tracks pending operations. When connectivity is restored via NetInfo listeners, background workers batch pending changes to the server. Conflicts are resolved via deterministic strategies like CRDTs (Conflict-free Replicated Data Types), vector clocks, or timestamp-based Last-Write-Wins.'
    },
    {
      category: 'Performance & Memory Management',
      questionText: 'How do you diagnose and fix memory leaks, excessive battery consumption, and dropped frames (jank) in a production mobile app?',
      expectedKeywords: ['memory leaks', 'flipper', 'profiler', '60fps', 'dropped frames', 'large lists', 'flatlist'],
      modelAnswer: 'Performance issues are diagnosed using Xcode Instruments, Android Studio Profiler, and Flipper. Memory leaks typically stem from uncleared timers, retained native subscriptions, or uncollected closures. For dropped frames (aiming for 60/120 FPS), ensure JavaScript doesn’t block the UI thread: utilize FlatList windowing optimizations (initialNumToRender, getItemLayout), cache images with react-native-fast-image, and run animations natively on the UI thread via Reanimated.'
    },
    {
      category: 'Mobile Security & Data Storage',
      questionText: 'How do you store sensitive credentials (auth tokens, encryption keys) securely on iOS and Android devices? Explain Keychain and Keystore/EncryptedSharedPreferences.',
      expectedKeywords: ['keychain', 'keystore', 'biometrics', 'secure enclave', 'encryptedsharedpreferences', 'jailbreak'],
      modelAnswer: 'Never store sensitive tokens in plain AsyncStorage or UserDefaults. On iOS, sensitive data must be stored in the iOS Keychain, protected by the hardware-backed Secure Enclave and accessible only after biometric or passcode unlock. On Android, the Android Keystore system generates cryptographic keys inside a Trusted Execution Environment (TEE), paired with EncryptedSharedPreferences for encrypted local storage. Production apps also incorporate root/jailbreak detection and SSL pinning.'
    },
    {
      category: 'App Store Guidelines & Release Pipeline',
      questionText: 'Describe how you manage mobile CI/CD, Over-The-Air (OTA) updates, and compliance with Apple App Store and Google Play Store review policies.',
      expectedKeywords: ['fastlane', 'ota updates', 'expo eas', 'code-push', 'app store review', 'provisioning profiles'],
      modelAnswer: 'Automated release pipelines utilize Fastlane or Expo EAS in CI/CD (GitHub Actions) to automate code signing (match certificates and provisioning profiles), screenshot generation, and builds for TestFlight and Google Play Internal Track. Over-The-Air (OTA) updates via EAS Update or CodePush allow instant bugfixes for JavaScript bundle assets without going through App Store review, strictly complying with store guidelines by never altering fundamental app capabilities.'
    }
  ],

  'Cybersecurity Analyst & Engineer': [
    {
      category: 'Web Security & OWASP Top 10',
      questionText: 'Explain the top web application security vulnerabilities from the OWASP Top 10. How do you detect and remediate Broken Access Control and SSRF?',
      expectedKeywords: ['owasp top 10', 'broken access control', 'ssrf', 'idor', 'least privilege', 'rbac', 'sanitization'],
      modelAnswer: 'Broken Access Control occurs when users act outside their intended permissions (e.g., Insecure Direct Object References where changing an ID in a URL accesses another user record). Mitigation enforces server-side Role-Based Access Control (RBAC) on every request, verifying ownership. Server-Side Request Forgery (SSRF) occurs when a web app fetches a remote resource without validating user-supplied URLs; mitigation involves IP address blacklisting (blocking 127.0.0.1 and cloud metadata 169.254.169.254) and allowlisting domains.'
    },
    {
      category: 'Cryptography & Public Key Infrastructure',
      questionText: 'Explain symmetric vs asymmetric encryption. How does the TLS 1.3 handshake establish a secure, encrypted session over an insecure network?',
      expectedKeywords: ['symmetric', 'asymmetric', 'tls 1.3', 'diffie-hellman', 'public key', 'private key', 'certificates', 'pki'],
      modelAnswer: 'Symmetric encryption (AES-256) uses a single shared secret key for encryption and decryption, offering rapid speed. Asymmetric encryption (RSA, ECC) uses mathematically linked public and private key pairs. In TLS 1.3, the client sends ClientHello with supported ciphers and Diffie-Hellman key shares. The server responds with ServerHello, selecting the cipher, presenting its digital certificate, and providing its key share. Both parties compute the shared session key in 1-RTT, encrypting all subsequent traffic.'
    },
    {
      category: 'Network Security & Penetration Testing',
      questionText: 'Walk me through the stages of a penetration test. How do tools like Nmap, Wireshark, and Metasploit assist in identifying and exploiting vulnerabilities?',
      expectedKeywords: ['reconnaissance', 'scanning', 'nmap', 'wireshark', 'metasploit', 'exploitation', 'privilege escalation'],
      modelAnswer: 'Penetration testing follows structured phases: 1) Reconnaissance (OSINT gathering); 2) Scanning & Enumeration (using Nmap for port discovery and service fingerprinting); 3) Vulnerability Assessment; 4) Exploitation (leveraging tools like Metasploit to prove exploitability); 5) Post-Exploitation & Privilege Escalation; and 6) Reporting with remediation steps. Wireshark captures raw network packets to detect unencrypted traffic, anomalous beaconing, and protocol anomalies.'
    },
    {
      category: 'Zero Trust & Identity Management (IAM)',
      questionText: 'What are the core principles of Zero Trust Architecture? How do MFA, OAuth 2.0 / OpenID Connect, and Least Privilege prevent credential-based breaches?',
      expectedKeywords: ['zero trust', 'never trust always verify', 'oauth 2.0', 'openid connect', 'mfa', 'least privilege', 'jwt'],
      modelAnswer: 'Zero Trust operates on the principle of "Never Trust, Always Verify": every access request is authenticated, authorized, and encrypted regardless of whether it originates inside or outside the network perimeter. Multi-Factor Authentication (MFA) defeats credential stuffing. OpenID Connect handles secure federated identity, and OAuth 2.0 grants scoped authorization tokens. Principles of Least Privilege guarantee accounts and services possess only the minimum required access permissions.'
    },
    {
      category: 'Incident Response & Threat Hunting',
      questionText: 'How do you coordinate an incident response when a critical server is compromised? Explain containment, eradication, forensics, and DDoS mitigation.',
      expectedKeywords: ['incident response', 'containment', 'forensics', 'ddos', 'siem', 'edr', 'eradication', 'post-mortem'],
      modelAnswer: 'Following the SANS/NIST Incident Response framework: 1) Preparation; 2) Identification via SIEM/EDR alerts; 3) Containment (isolating affected VMs from the network while preserving memory for volatile memory forensics); 4) Eradication (remediating vulnerabilities, revoking compromised credentials, wiping infected systems); 5) Recovery (restoring verified clean backups with heightened logging); and 6) Lessons Learned (post-mortem). DDoS attacks are mitigated upstream via Anycast routing and WAF/scrubbing centers like Cloudflare.'
    }
  ],

  'Data Engineer': [
    {
      category: 'Data Warehousing & Architecture',
      questionText: 'Compare a Data Warehouse, a Data Lake, and a Lakehouse architecture. How do tools like Snowflake, BigQuery, and Databricks Delta Lake fit in?',
      expectedKeywords: ['data warehouse', 'data lake', 'lakehouse', 'snowflake', 'bigquery', 'delta lake', 'parquet', 'acid'],
      modelAnswer: 'A Data Warehouse (Snowflake, BigQuery) stores structured, cleaned data optimized for fast SQL queries and business intelligence using columnar storage. A Data Lake (S3, ADLS) stores raw structured, semi-structured, and unstructured data at low cost in open formats like Parquet/ORC. A Lakehouse (Databricks Delta Lake) combines both: bringing ACID transactions, versioning (time travel), and schema enforcement on top of cheap object storage, enabling both BI queries and direct ML training.'
    },
    {
      category: 'Distributed Processing with Apache Spark',
      questionText: 'How does Apache Spark execute distributed data processing? Explain RDDs, DataFrames, Catalyst Optimizer, and how to resolve expensive Shuffles.',
      expectedKeywords: ['apache spark', 'rdd', 'dataframe', 'catalyst optimizer', 'shuffle', 'broadcast join', 'partitioning'],
      modelAnswer: 'Spark uses in-memory distributed compute across Driver and Worker nodes. DataFrames provide structured abstractions optimized by the Catalyst Optimizer, which generates optimized execution plans (predicate pushdown, projection pruning). Shuffling occurs during wide transformations (groupBy, join), which re-partitions data across the network, causing severe performance bottlenecks. Shuffles are mitigated by increasing partitions, pre-partitioning by join keys, or using Broadcast Hash Joins for small dimension tables.'
    },
    {
      category: 'Real-time Streaming with Apache Kafka',
      questionText: 'Explain the internal architecture of Apache Kafka. How do partitions, consumer groups, offsets, and log retention guarantee high throughput and ordering?',
      expectedKeywords: ['kafka', 'partitions', 'consumer groups', 'offsets', 'ordering', 'replication', 'exactly-once'],
      modelAnswer: 'Kafka is a distributed append-only commit log. Topics are divided into partitions, which are the unit of parallelism. Kafka guarantees message ordering strictly within a partition. Consumer groups distribute partitions among consumers: each partition is read by exactly one consumer in the group. Consumers track their progress by committing offsets. Kafka achieves high throughput via sequential disk I/O, zero-copy network transfer (sendfile OS syscall), and batching.'
    },
    {
      category: 'Data Modeling & Dimensional Design',
      questionText: 'Compare Star Schema vs Snowflake Schema in dimensional modeling. When would you use Slowly Changing Dimensions (SCD Type 1 vs Type 2)?',
      expectedKeywords: ['star schema', 'snowflake schema', 'fact table', 'dimension table', 'scd type 1', 'scd type 2', 'normalization'],
      modelAnswer: 'A Star Schema has a central Fact table surrounded by denormalized Dimension tables, providing simpler SQL queries and faster OLAP performance. A Snowflake Schema normalizes dimension tables into hierarchies, reducing redundancy but requiring more complex JOINs. Slowly Changing Dimensions handle dimension attribute updates: SCD Type 1 overwrites old values with no history; SCD Type 2 creates a new record with valid_from/valid_to timestamps, preserving full historical integrity.'
    },
    {
      category: 'Pipeline Orchestration & Data Quality',
      questionText: 'How do you design robust, idempotent ETL/ELT pipelines using Apache Airflow? How do you implement data quality checks and automated alerts?',
      expectedKeywords: ['airflow', 'dag', 'idempotency', 'backfilling', 'data quality', 'great expectations', 'dbt'],
      modelAnswer: 'Airflow orchestrates pipelines using Directed Acyclic Graphs (DAGs). Idempotency ensures running a DAG for any execution date multiple times yields the exact same state without duplicating data, achieved by atomic partition overwrites rather than blind appends. Data transformation is executed in dbt, and automated data quality assertions (null checks, uniqueness, distribution checks) are verified using Great Expectations before promoting data to production analytics marts.'
    }
  ],

  'System Design & Cloud Architect': [
    {
      category: 'Distributed Systems & Consistency',
      questionText: 'Explain the CAP Theorem and PACELC theorem. How do distributed databases (Cassandra, DynamoDB, CockroachDB) make trade-offs between Consistency and Availability?',
      expectedKeywords: ['cap theorem', 'pacelc', 'consistency', 'availability', 'partition tolerance', 'eventual consistency', 'quorum'],
      modelAnswer: 'The CAP theorem states that under a network Partition (P), a distributed system must choose between Consistency (C) and Availability (A). PACELC extends this: if Partitioned (P), choose A or C; Else (E), choose Latency (L) or Consistency (C). Systems like Cassandra prioritize AP/PAEL (eventual consistency with tunable quorum read/write for ultra-low latency). CockroachDB and Spanner prioritize CP/PC (strong serializable consistency via Raft consensus algorithms and atomic clocks).'
    },
    {
      category: 'Data Partitioning & Scalability',
      questionText: 'Explain database Sharding and Consistent Hashing. How does consistent hashing prevent massive data reshuffling when nodes join or leave a cluster?',
      expectedKeywords: ['consistent hashing', 'sharding', 'hash ring', 'virtual nodes', 'rebalancing', 'horizontal scaling'],
      modelAnswer: 'Sharding partitions large databases horizontally across multiple servers. Standard modulo hashing (hash(key) % N) causes almost 100% of keys to rehash when a server is added or removed. Consistent Hashing maps both keys and servers to a circular hash ring (0 to 2^32 - 1). A key is assigned to the first server encountered clockwise. When a node leaves or joins, only k/N keys need to be relocated. Virtual nodes distribute load evenly across nodes to prevent hot spots.'
    },
    {
      category: 'Real-Time System Design Scenario',
      questionText: 'Walk me through designing a real-time messaging application like WhatsApp supporting 500 million active users. Cover connection management, message delivery, and storage.',
      expectedKeywords: ['websockets', 'message queue', 'cassandra', 'push notifications', 'presence service', 'end-to-end encryption'],
      modelAnswer: 'Architecture features an API Gateway with persistent WebSocket connections managed by a distributed connection gateway pool. A distributed Redis cluster acts as a Presence Service tracking online user socket IDs. When user A sends a message to user B: if B is online, the message routes directly through the message queue to B socket server; if B is offline, the message is stored in an append-only NoSQL store (Cassandra) and a push notification triggers via APNs/FCM. Messages are marked delivered and read via bidirectional receipts.'
    },
    {
      category: 'Fault Tolerance & Resilience Patterns',
      questionText: 'How do you design microservices for high resilience against cascading failures? Explain Circuit Breaker, Rate Limiting, and Bulkhead patterns.',
      expectedKeywords: ['circuit breaker', 'bulkhead', 'rate limiting', 'retry with backoff', 'fallback', 'chaos engineering'],
      modelAnswer: 'Cascading failures happen when one failing service exhausts thread pools in upstream services. The Circuit Breaker pattern (Hystrix/Resilience4j) monitors error rates; when thresholds exceed limits, it trips Open, instantly failing fast or returning cached fallback responses without stressing the downstream service. The Bulkhead pattern isolates resources (separate thread pools/connection pools per service) so one failing dependency cannot consume all system resources. Exponential backoff with jitter prevents thundering herd retries.'
    },
    {
      category: 'High Availability & Global Disaster Recovery',
      questionText: 'How do you architect a multi-region cloud deployment for 99.999% availability? Discuss active-active vs active-passive and data replication latency.',
      expectedKeywords: ['active-active', 'active-passive', 'multi-region', 'rto', 'rpo', 'route 53', 'replication latency'],
      modelAnswer: 'Achieving five-nines (5.26 minutes annual downtime) requires multi-region redundancy. Active-Passive designates a primary region with standby replicated systems; failover is triggered via DNS (Route 53 health checks), defined by Recovery Time Objective (RTO) and Recovery Point Objective (RPO). Active-Active serves traffic simultaneously from all regions using Geo-DNS or Anycast routing; the primary challenge is cross-region replication latency and write conflict resolution, solved via multi-master databases with CRDTs or regional data sharding.'
    }
  ],

  'QA & Test Automation Engineer': [
    {
      category: 'Testing Methodologies & Test Pyramid',
      questionText: 'Explain the Test Automation Pyramid (Unit, Integration, E2E). What are the cost, execution speed, and confidence trade-offs at each level?',
      expectedKeywords: ['test pyramid', 'unit tests', 'integration tests', 'e2e tests', 'test coverage', 'cost', 'flakiness'],
      modelAnswer: 'The Test Pyramid advocates for a large base of Unit tests, a moderate layer of Integration tests, and a small peak of End-to-End (E2E) tests. Unit tests test isolated functions in milliseconds with low cost and pinpoint precision. Integration tests verify interactions between components, databases, and APIs. E2E tests test critical user flows through the browser; they provide the highest confidence but are slow to execute, expensive to maintain, and prone to flakiness.'
    },
    {
      category: 'Web Automation Frameworks (Cypress vs Selenium)',
      questionText: 'Compare Cypress vs Selenium WebDriver / Playwright. Explain browser architectures, execution models, and handling flakiness.',
      expectedKeywords: ['cypress', 'selenium', 'playwright', 'webdriver', 'cdp', 'flakiness', 'auto-waiting'],
      modelAnswer: 'Selenium uses WebDriver to communicate with browser drivers via HTTP JSON wire protocols from outside the browser process. Cypress runs directly inside the browser run-loop alongside the application, providing native access to DOM, network requests, and console events, but historically limited to a single tab. Playwright connects directly to browser binaries via WebSocket and Chrome DevTools Protocol (CDP), supporting multi-tab, multi-origin, and fast auto-waiting, drastically reducing flaky tests.'
    },
    {
      category: 'API Automation & Performance Testing',
      questionText: 'How do you design an automated API testing framework? How do you validate status codes, schema contracts, response payloads, and performance under load?',
      expectedKeywords: ['api testing', 'rest assured', 'postman', 'json schema validation', 'jmeter', 'k6', 'load testing'],
      modelAnswer: 'An automated API testing framework (using RestAssured or Supertest/Jest) validates: 1) HTTP status codes; 2) Response headers; 3) Response body schema conformance using JSON Schema validators; and 4) Business logic assertions. For performance and stress testing, tools like k6 or Apache JMeter simulate concurrent virtual users to establish performance baselines, measuring response time percentiles (p95, p99), throughput (RPS), and error rate thresholds.'
    },
    {
      category: 'Test Automation Design Patterns (Page Object Model)',
      questionText: 'Explain the Page Object Model (POM) pattern in test automation. How does it improve test maintainability, reusability, and separation of concerns?',
      expectedKeywords: ['page object model', 'pom', 'reusability', 'maintainability', 'selectors', 'clean code'],
      modelAnswer: 'The Page Object Model (POM) abstracts web pages into reusable class objects. The page class encapsulates element selectors (locators) and user action methods (e.g., login, clickCheckout). Test scripts instantiate these page objects and invoke action methods rather than hardcoding DOM locators directly in tests. If UI selectors change, updates are made solely in the Page Object class without modifying individual test scenarios, drastically reducing maintenance overhead.'
    },
    {
      category: 'CI/CD Test Integration & Flakiness Management',
      questionText: 'How do you integrate automated test suites into CI/CD pipelines? How do you detect, isolate, and eliminate flaky tests in build pipelines?',
      expectedKeywords: ['ci/cd', 'flaky tests', 'github actions', 'parallel execution', 'test retry', 'quarantine', 'allure reports'],
      modelAnswer: 'Automated tests run on every pull request within GitHub Actions or Jenkins. Heavy test suites leverage test sharding across parallel CI containers. Flaky tests (tests that pass and fail intermittently without code changes) are detected using failure rate analytics. Flaky tests are quarantined into a non-blocking test bucket so they do not block development pipelines, diagnosed via video recordings and network logs, and remediated by eliminating hardcoded sleeps in favor of explicit dynamic auto-waits.'
    }
  ],

  'Blockchain & Web3 Developer': [
    {
      category: 'EVM Internals & Smart Contracts',
      questionText: 'Explain how the Ethereum Virtual Machine (EVM) executes smart contracts. What is Gas, and how do you optimize gas costs in Solidity?',
      expectedKeywords: ['evm', 'gas optimization', 'solidity', 'storage vs memory', 'opcodes', 'calldata', 'uint256'],
      modelAnswer: 'The EVM is a stack-based virtual machine executing bytecode instructions. Gas measures the computational and storage resources required for execution, paid in Ether to prevent infinite execution loops (Halting problem). To optimize gas: 1) Minimize costly SSTORE operations by packing variables into 32-byte storage slots; 2) Use memory or calldata instead of storage for function parameters; 3) Cache array lengths in memory loops; and 4) Use custom errors instead of verbose require string messages.'
    },
    {
      category: 'Smart Contract Security & Vulnerabilities',
      questionText: 'Explain Reentrancy attacks, Front-Running, and Integer Overflow in Solidity. How do ReentrancyGuard and Checks-Effects-Interactions prevent exploits?',
      expectedKeywords: ['reentrancy', 'checks-effects-interactions', 'reentrancyguard', 'mev', 'front-running', 'solidity 0.8'],
      modelAnswer: 'A reentrancy attack occurs when an external contract call hijacks execution flow and repeatedly calls back into the vulnerable function before internal state updates finish (draining funds like the DAO hack). It is mitigated by strictly adhering to the Checks-Effects-Interactions pattern (updating internal balances before sending external funds) or using OpenZeppelin ReentrancyGuard. Front-running is mitigated by commit-reveal schemes or private transaction relays (Flashbots).'
    },
    {
      category: 'Token Standards & Contract Upgradeability',
      questionText: 'Compare ERC-20, ERC-721, and ERC-1155 token standards. How do Proxy patterns (UUPS vs Transparent Proxy) achieve smart contract upgradeability?',
      expectedKeywords: ['erc-20', 'erc-721', 'erc-1155', 'proxy pattern', 'delegatecall', 'uups', 'transparent proxy'],
      modelAnswer: 'ERC-20 standardizes fungible tokens; ERC-721 standardizes non-fungible tokens (NFTs with unique IDs); ERC-1155 is a multi-token standard handling batch transfers of both fungible and non-fungible items in a single contract. Because smart contracts are immutable once deployed, upgradeability is achieved via Proxy contracts using delegatecall: users interact with the Proxy holding contract state, which delegates execution logic to an implementation contract that can be upgraded.'
    },
    {
      category: 'Layer 2 Scaling & Rollups',
      questionText: 'How do Layer 2 scaling solutions scale Ethereum throughput? Compare Optimistic Rollups vs Zero-Knowledge (ZK) Rollups.',
      expectedKeywords: ['layer 2', 'optimistic rollups', 'zk-rollups', 'fraud proofs', 'zk-snarks', 'arbitrum', 'optimism'],
      modelAnswer: 'Layer 2 solutions execute transactions off-chain and post compressed transaction data or state commitments back to Layer 1 (Ethereum) for security and settlement. Optimistic Rollups (Arbitrum, Optimism) assume transactions are valid by default and provide a 7-day challenge window where fraud proofs can dispute invalid state transitions. ZK-Rollups (zkSync, Starknet) compute cryptographic Zero-Knowledge validity proofs (ZK-SNARKs/STARKs) off-chain; state is verified mathematically and finalized immediately on Layer 1.'
    },
    {
      category: 'Web3 Frontend & Decentralized Architecture',
      questionText: 'How does a Web3 DApp connect to the blockchain? Explain EIP-712 typed data signing, RPC providers, and wallet session management.',
      expectedKeywords: ['web3', 'ethers.js', 'viem', 'wagmi', 'eip-712', 'rpc provider', 'metamask', 'smart contract call'],
      modelAnswer: 'Web3 frontend applications connect via libraries like Wagmi and Viem/Ethers.js interfacing with browser wallet extensions (MetaMask) through window.ethereum. Read operations query JSON-RPC nodes (Infura, Alchemy). Write operations require user cryptographic key signatures triggering on-chain transactions. EIP-712 standardizes typed structured data signing, allowing users to review readable messages before signing off-chain gasless orders or authorizations.'
    }
  ],

  'Embedded Systems & IoT Engineer': [
    {
      category: 'Microcontroller Architecture & Memory',
      questionText: 'Explain the internal architecture of a modern microcontroller (ARM Cortex-M). How are Flash, SRAM, and Special Function Registers (SFRs) mapped?',
      expectedKeywords: ['arm cortex-m', 'flash', 'sram', 'memory mapped i/o', 'registers', 'harvard architecture', 'stack pointer'],
      modelAnswer: 'ARM Cortex-M microcontrollers use modified Harvard architecture with unified 32-bit linear memory space. Flash stores non-volatile program code and constants. SRAM holds volatile stack, heap, and global variables. Peripheral hardware (GPIO, Timers, UART) is accessed via Memory-Mapped I/O through Special Function Registers (SFRs) residing at dedicated memory addresses. The CPU boots by loading the Initial Stack Pointer and Reset Handler address from the Vector Table.'
    },
    {
      category: 'Interrupts & Concurrency',
      questionText: 'What is an Interrupt Service Routine (ISR)? How do you prevent race conditions, priority inversion, and volatile variable bugs in embedded C?',
      expectedKeywords: ['isr', 'volatile', 'race condition', 'priority inversion', 'atomic', 'critical section', 'nvic'],
      modelAnswer: 'An ISR is hardware-triggered code execution managed by the Nested Vectored Interrupt Controller (NVIC). ISRs must be kept extremely brief: setting flags or pushing to queues. Shared variables must be marked volatile to prevent the compiler from caching values in CPU registers. Race conditions are prevented by disabling interrupts during atomic read-modify-write operations or using mutexes. Priority inversion is resolved using Priority Ceiling or Priority Inheritance protocols.'
    },
    {
      category: 'Communication Protocols (UART, SPI, I2C, CAN)',
      questionText: 'Compare UART, SPI, I2C, and CAN bus protocols. What are their data rates, master-slave topologies, wire counts, and noise immunity trade-offs?',
      expectedKeywords: ['uart', 'spi', 'i2c', 'can bus', 'baud rate', 'pull-up resistors', 'clock line', 'differential signaling'],
      modelAnswer: 'UART is asynchronous, full-duplex point-to-point (2 wires: TX, RX) using agreed baud rates without a clock. I2C is synchronous, multi-master/multi-slave (2 wires: SDA, SCL) using open-drain lines with pull-up resistors and addressing, running up to 3.4 Mbps. SPI is synchronous, single-master full-duplex (4 wires: MOSI, MISO, SCK, CS) reaching 50+ Mbps but requiring separate Chip Selects per slave. CAN bus uses differential signaling (CAN_H, CAN_L) with message arbitration, delivering unmatched noise immunity in automotive environments.'
    },
    {
      category: 'Real-Time Operating Systems (RTOS)',
      questionText: 'How does a Real-Time Operating System (FreeRTOS) achieve deterministic task scheduling? Explain preemptive scheduling, queues, and task states.',
      expectedKeywords: ['freertos', 'rtos', 'preemptive scheduling', 'task state', 'tick timer', 'queue', 'semaphore', 'context switch'],
      modelAnswer: 'FreeRTOS provides deterministic execution using a prioritized preemptive scheduler driven by a periodic hardware SysTick timer. Tasks transition between Running, Ready, Blocked, and Suspended states. When a higher-priority task unblocks (e.g., from an ISR event), the scheduler performs an immediate context switch by saving current CPU registers onto the task stack and restoring the new task stack. Inter-task synchronization uses thread-safe Queues, Binary/Counting Semaphores, and Mutexes.'
    },
    {
      category: 'Low Power Optimization & IoT Telemetry',
      questionText: 'How do you design battery-powered IoT devices to operate for years? Discuss Sleep Modes, Watchdog Timers, and MQTT/CoAP telemetry.',
      expectedKeywords: ['sleep mode', 'deep sleep', 'watchdog timer', 'mqtt', 'coap', 'low power', 'brownout detection'],
      modelAnswer: 'Battery longevity requires operating in Deep Sleep mode (>99% of time, drawing microamps) where high-speed clocks and peripherals shut down, waking up via Real-Time Clocks (RTC) or external interrupts. Hardware Watchdog Timers reset the processor if firmware hangs, and brownout detectors prevent memory corruption during voltage drops. IoT devices transmit compressed telemetry over lightweight protocols: MQTT (over TCP with QoS levels) or CoAP (over UDP for constrained devices).'
    }
  ],

  'Database Administrator (DBA)': [
    {
      category: 'Database Internals & Transaction Isolation',
      questionText: 'Explain ACID properties and the four ANSI SQL Transaction Isolation Levels. How does Multi-Version Concurrency Control (MVCC) prevent dirty reads without locking?',
      expectedKeywords: ['acid', 'isolation levels', 'mvcc', 'dirty read', 'phantom read', 'non-repeatable read', 'wal'],
      modelAnswer: 'ACID guarantees Atomicity, Consistency, Isolation, and Durability. Isolation levels range from Read Uncommitted, Read Committed, Repeatable Read, to Serializable. In modern databases like PostgreSQL, Multi-Version Concurrency Control (MVCC) avoids read locks by storing multiple versions of tuples with transaction visibility timestamps (xmin, xmax). Readers never block writers, and writers never block readers, completely eliminating dirty reads while maintaining high concurrency.'
    },
    {
      category: 'Index Architecture & Query Optimization',
      questionText: 'How do you read and interpret an EXPLAIN ANALYZE execution plan in PostgreSQL or MySQL? Contrast Sequential Scans, Index Scans, and Bitmap Heap Scans.',
      expectedKeywords: ['explain analyze', 'index scan', 'sequential scan', 'bitmap heap scan', 'cost', 'query optimization', 'b-tree'],
      modelAnswer: 'EXPLAIN ANALYZE executes the query and reports actual execution time and rows vs planner estimates. A Sequential Scan reads the entire table from disk. An Index Scan traverses the B-Tree index to locate row pointers, ideal for high selectivity. A Bitmap Index Scan creates a memory bitmap of matching page locations when retrieving multiple rows, followed by a Bitmap Heap Scan to fetch pages in physical disk order, drastically reducing random disk I/O.'
    },
    {
      category: 'High Availability & Replication',
      questionText: 'Compare Synchronous vs Asynchronous database replication. How do you design high-availability clustering and automated failover (Patroni / Galera)?',
      expectedKeywords: ['replication', 'synchronous', 'asynchronous', 'patroni', 'raft', 'failover', 'split-brain', 'wal archiving'],
      modelAnswer: 'Asynchronous replication commits on the primary immediately and streams Write-Ahead Logs (WAL) to standbys, providing zero write latency overhead but risking data loss during abrupt primary failure. Synchronous replication waits for at least one standby confirmation before committing, guaranteeing zero RPO at the cost of write latency. HA systems like Patroni use distributed consensus (etcd/Consul) with Raft to elect primary nodes and prevent catastrophic split-brain scenarios.'
    },
    {
      category: 'Partitioning & Large Database Maintenance',
      questionText: 'When and how do you implement table partitioning (Range, List, Hash)? How do you manage vacuuming (Autovacuum), table bloat, and connection pooling?',
      expectedKeywords: ['table partitioning', 'range partitioning', 'autovacuum', 'bloat', 'pgbouncer', 'connection pooling'],
      modelAnswer: 'Partitioning splits large tables (e.g. 500M+ rows) into smaller physical child tables by date ranges or hash keys, enabling Partition Pruning where the query planner skips irrelevant partitions completely. Table bloat occurs in MVCC when dead tuples accumulate from frequent updates; Autovacuum must be tuned to reclaim page space without saturating disk I/O. Connection pooling via PgBouncer prevents memory exhaustion by reusing persistent database server connections.'
    },
    {
      category: 'Disaster Recovery & Backup Strategy',
      questionText: 'How do you design an enterprise database Disaster Recovery strategy? Explain Point-in-Time Recovery (PITR), base backups, and WAL streaming.',
      expectedKeywords: ['disaster recovery', 'pitr', 'point in time recovery', 'wal', 'base backup', 'rto', 'rpo'],
      modelAnswer: 'Enterprise backup combines regular physical Base Backups (pg_basebackup / Percona XtraBackup) with continuous Write-Ahead Log (WAL) archiving to durable object storage (AWS S3). Point-in-Time Recovery (PITR) restores the latest base backup and replays archived WAL records up to a specific timestamp or transaction ID, allowing recovery to the exact minute before an accidental drop or corruption with near-zero data loss.'
    }
  ],

  'UI/UX & Product Designer': [
    {
      category: 'Design Systems & Component Architecture',
      questionText: 'How do you architect a scalable enterprise Design System in Figma? Explain design tokens, auto-layout, component variants, and developer handoff.',
      expectedKeywords: ['design system', 'design tokens', 'figma', 'auto-layout', 'variants', 'developer handoff', 'atomic design'],
      modelAnswer: 'A scalable design system is built using atomic design methodology (atoms, molecules, organisms). Design tokens define fundamental visual values (color palettes, typographic scales, spacing units, elevation) as platform-agnostic variables. In Figma, components use Auto-Layout for responsive resizing and Component Sets with interactive Variants for hover/active/disabled states. Developer handoff integrates token synchronization tools (Tokens Studio) exporting directly to JSON/CSS variables.'
    },
    {
      category: 'User Research & Discovery (Double Diamond)',
      questionText: 'Walk me through the Double Diamond design framework (Discover, Define, Develop, Deliver). How do you validate hypotheses using qualitative and quantitative data?',
      expectedKeywords: ['double diamond', 'user research', 'user interviews', 'usability testing', 'heuristics', 'personas', 'wireframing'],
      modelAnswer: 'The Double Diamond represents divergent and convergent thinking phases: 1) Discover (divergent: conducting user interviews, competitive analysis, analytics reviews); 2) Define (convergent: synthesizing insights into user personas, journey maps, and problem statements); 3) Develop (divergent: rapid ideation, low-fidelity wireframing, interactive prototyping); and 4) Deliver (convergent: usability testing, high-fidelity refinement, engineering implementation). Hypotheses are validated through task completion rates, usability testing, and A/B test metrics.'
    },
    {
      category: 'Web Accessibility & Inclusive Design (WCAG)',
      questionText: 'Explain the core principles of WCAG 2.1 (POUR: Perceivable, Operable, Understandable, Robust). How do you design for keyboard navigation and screen readers?',
      expectedKeywords: ['wcag', 'accessibility', 'contrast ratio', 'keyboard navigation', 'screen reader', 'focus states', 'aria'],
      modelAnswer: 'WCAG guidelines require interfaces to be Perceivable (color contrast ratios of at least 4.5:1 for normal text, alt text for imagery), Operable (all interactive elements operable via keyboard navigation with visible focus rings), Understandable (clear language, predictable error handling), and Robust (compatible with assistive screen readers via semantic HTML and ARIA labels). Inclusive design ensures users with visual, auditory, cognitive, or motor impairments experience seamless interaction.'
    },
    {
      category: 'Information Architecture & Usability Heuristics',
      questionText: 'How do you evaluate and optimize user flows using Nielsen’s 10 Usability Heuristics? Provide practical examples of Visibility of System Status and Error Prevention.',
      expectedKeywords: ['usability heuristics', 'nielsen', 'system status', 'error prevention', 'user control', 'cognitive load'],
      modelAnswer: 'Jakob Nielsen’s Heuristics provide a framework for usability evaluation: Visibility of System Status requires keeping users informed with clear progress bars and active loading states. Error Prevention designs constraints (e.g. disabling submit until required fields are filled, confirmation dialogues before destructive actions). Match between system and the real world ensures familiar terminology. User control and freedom provides effortless Undo/Redo capabilities.'
    },
    {
      category: 'Design Metrics & Business Impact',
      questionText: 'How do you measure the success of a UX redesign? How do UX metrics (SUS, Task Success Rate, Time on Task) connect with business KPIs (Conversion, Churn)?',
      expectedKeywords: ['ux metrics', 'sus score', 'task success rate', 'time on task', 'conversion rate', 'churn', 'retention'],
      modelAnswer: 'UX success is measured using both qualitative metrics (System Usability Scale [SUS] score, Customer Effort Score [CES]) and behavioral usability metrics (Task Success Rate, Time on Task, Drop-off rate at checkout). These directly correlate to business KPIs: reducing cognitive load and frictionless navigation increases conversion rates, improves Net Promoter Score (NPS), and directly reduces customer churn and support ticket volume.'
    }
  ]
};

// Fallback when role isn't explicitly in the bank
const DEFAULT_QUESTIONS = ROLE_QUESTION_BANKS['Full Stack Developer'];

/**
 * Helper to call Gemini API with model fallback
 */
async function callGemini(apiKey, prompt) {
  const models = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`[Gemini Live API] Successfully generated response using ${model}!`);
          return JSON.parse(text);
        }
      }
    } catch (err) {
      console.warn(`Gemini API call on ${model} failed:`, err.message);
    }
  }
  return null;
}

/**
 * Fetch or generate an interview question
 */
async function generateInterviewQuestion(role, difficulty, questionIndex, previousQuestions = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    const prompt = `You are a world-class technical interviewer conducting an authentic 5-question technical interview for a ${difficulty} level candidate in the domain: "${role}".
This is Question ${questionIndex + 1} of 5.

CRITICAL INSTRUCTIONS:
- You must ask a deep, authentic technical question strictly and exclusively about "${role}". Do NOT ask questions outside this domain.
- The question must match Question ${questionIndex + 1} progression:
  * Question 1: Core foundational principles & internal architecture of ${role}.
  * Question 2: Practical implementation, concurrency/state, or engineering best practices in ${role}.
  * Question 3: Deep dive into performance optimization, edge cases, or debugging in ${role}.
  * Question 4: Scalability, security, or enterprise design patterns in ${role}.
  * Question 5: Complex real-world production incident/scenario and engineering trade-offs in ${role}.
${previousQuestions.length > 0 ? `Previous questions already asked in this session (do not repeat): ${JSON.stringify(previousQuestions.map(q => q.questionText))}` : ''}

Output strictly valid JSON with this exact schema:
{
  "category": "Specific ${role} Sub-Topic",
  "questionText": "Clear, detailed technical interview question specifically for ${role}",
  "expectedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "modelAnswer": "Comprehensive, senior-level architectural model answer"
}`;

    const parsed = await callGemini(apiKey, prompt);
    if (parsed) {
      return {
        category: parsed.category || `${role} Concepts`,
        questionText: parsed.questionText,
        expectedKeywords: parsed.expectedKeywords || [],
        modelAnswer: parsed.modelAnswer || ''
      };
    }
  }

  // Intelligent fallback from curated question bank strictly matching question progression (1 to 5)
  const roleBank = ROLE_QUESTION_BANKS[role] || DEFAULT_QUESTIONS;
  const idx = Math.min(Math.max(0, questionIndex), roleBank.length - 1);
  const q = roleBank[idx];

  return {
    category: q.category,
    questionText: q.questionText,
    expectedKeywords: q.expectedKeywords,
    modelAnswer: q.modelAnswer
  };
}

/**
 * Evaluate candidate response with rubric scoring
 */
async function evaluateInterviewAnswer(questionText, expectedKeywords, candidateAnswer, codeSnippet = '', difficulty = 'Mid') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    const prompt = `You are a strict but constructive senior engineering interviewer evaluating a candidate's answer.
Difficulty level: ${difficulty}
Question: "${questionText}"
Candidate Answer: "${candidateAnswer}"
${codeSnippet ? `Candidate Code: """${codeSnippet}"""` : ''}

Evaluate the candidate and return strictly valid JSON matching this schema:
{
  "score": <number 0 to 100>,
  "accuracy": <number 0 to 100>,
  "clarity": <number 0 to 100>,
  "depth": <number 0 to 100>,
  "strengths": "<Specific key strength observed in their answer>",
  "improvements": "<Specific actionable areas they missed or could improve>",
  "modelAnswer": "<A concise, high-impact model answer>"
}`;

    const result = await callGemini(apiKey, prompt);
    if (result) {
      return result;
    }
  }

  // Intelligent Heuristic Evaluation Engine
  const text = (candidateAnswer || '').toLowerCase();
  const code = (codeSnippet || '').trim();

  let matchedKeywords = 0;
  if (expectedKeywords && expectedKeywords.length > 0) {
    expectedKeywords.forEach(kw => {
      if (text.includes(kw.toLowerCase())) matchedKeywords++;
    });
  }

  const keywordRatio = expectedKeywords && expectedKeywords.length > 0
    ? matchedKeywords / expectedKeywords.length
    : 0.7;

  // Word count analysis
  const words = text.split(/\s+/).filter(Boolean).length;

  let accuracy = Math.min(100, Math.round(50 + keywordRatio * 45));
  let depth = Math.min(100, Math.round(40 + (words > 60 ? 35 : words * 0.5) + (code ? 20 : 0)));
  let clarity = Math.min(100, Math.round(60 + (words > 25 ? 30 : words)));

  if (words < 10) {
    accuracy = Math.min(accuracy, 40);
    depth = 30;
    clarity = 50;
  }

  const totalScore = Math.round((accuracy * 0.45) + (depth * 0.35) + (clarity * 0.20));

  let strengths = '';
  let improvements = '';

  if (matchedKeywords > 2 || words > 50) {
    strengths = `Demonstrated solid foundational awareness, addressing core concepts (${matchedKeywords} key technical terms recognized). Good logical flow.`;
  } else {
    strengths = 'Provided a direct initial response with good attempt at conceptual framing.';
  }

  if (keywordRatio < 0.6) {
    improvements = `Could delve deeper into trade-offs and underlying architecture. Consider discussing internal mechanics like: ${(expectedKeywords || []).slice(0, 3).join(', ')}.`;
  } else if (!code && questionText.toLowerCase().includes('how')) {
    improvements = 'Complement your conceptual explanation with a concise code example or edge-case consideration to demonstrate production mastery.';
  } else {
    improvements = 'Strong delivery! Further elevate your answer by highlighting scalability limits and monitoring approaches.';
  }

  return {
    score: totalScore,
    accuracy,
    clarity,
    depth,
    strengths,
    improvements,
    modelAnswer: 'Ensure you address both the high-level purpose and the low-level execution details, followed by architectural trade-offs.'
  };
}

/**
 * Generate comprehensive final feedback from all question evaluations
 */
function generateOverallFeedback(questions) {
  if (!questions || questions.length === 0) {
    return {
      totalScore: 0,
      overallFeedback: 'No questions answered.',
      topStrengths: [],
      keyRecommendations: []
    };
  }

  const scores = questions.map(q => q.evaluation?.score || 0);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const topStrengths = [];
  const keyRecommendations = [];

  if (avgScore >= 80) {
    topStrengths.push('Exceptional technical precision and breadth across evaluated topics.');
    topStrengths.push('Clear articulation of architectural trade-offs and performance implications.');
    keyRecommendations.push('Ready for senior technical rounds. Continue staying updated on system design patterns.');
  } else if (avgScore >= 60) {
    topStrengths.push('Solid grasp of foundational engineering concepts.');
    topStrengths.push('Capable of framing end-to-end solutions.');
    keyRecommendations.push('Elaborate further on internal execution models and memory/concurrency trade-offs.');
    keyRecommendations.push('Incorporate practical code patterns or system diagnostics in responses.');
  } else {
    topStrengths.push('Good basic intuition and willingness to tackle complex technical questions.');
    keyRecommendations.push('Review fundamental definitions and core lifecycle/event loop concepts.');
    keyRecommendations.push('Practice structuring responses using the STAR or Concept -> Mechanism -> Tradeoff method.');
  }

  let overallFeedback = `Candidate completed ${questions.length} technical questions with an overall composite score of ${avgScore}/100. `;
  if (avgScore >= 80) overallFeedback += 'Candidate exhibits strong readiness for top-tier placement opportunities.';
  else if (avgScore >= 60) overallFeedback += 'Candidate has good baseline knowledge with high growth potential through targeted practice.';
  else overallFeedback += 'Candidate would benefit from further study of core topics before campus placements.';

  return {
    totalScore: avgScore,
    overallFeedback,
    topStrengths,
    keyRecommendations
  };
}

module.exports = {
  generateInterviewQuestion,
  evaluateInterviewAnswer,
  generateOverallFeedback
};
