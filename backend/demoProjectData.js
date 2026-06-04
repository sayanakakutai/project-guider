export const demoProjectData = {
  name: "SmartFleet: AI-Powered Logistics & Route Optimizer",
  domain: "Logistics, Supply Chain Management, and AI-Driven Operations",
  objective: "To design and deploy a real-time, AI-driven vehicle routing and scheduling optimizer that reduces fuel consumption, maximizes fleet capacity utilization, and dynamically responds to traffic and weather events.",
  problemStatement: "Traditional logistics routing rely on static heuristics or simple shortest-path algorithms (like Dijkstra's) which fail to account for dynamic traffic congestions, complex vehicle capacity constraints, time windows, and multi-stop deliveries. This leads to 20-30% fuel waste, delayed deliveries, and sub-optimal driver assignments.",
  scope: "Enterprise-grade fleet management backend and dynamic operator dashboard. Supports up to 500 active vehicles, real-time tracking, route planning, driver communication, and performance monitoring.",
  features: [
    "Dynamic Vehicle Routing Problem (VRP) solver with traffic/weather inputs",
    "Real-time GPS tracking dashboard via WebSockets",
    "Predictive ETA using PyTorch LSTM models",
    "Driver capacity optimizer with time windows (VRPTW)",
    "Instant documentation, report, and slide generation for logistics audits",
    "Interactive mock interviewer and academic viva simulator for training"
  ],
  functionalRequirements: [
    "FR1: System must compute optimized routes for N vehicles with custom capacities in under 5 seconds.",
    "FR2: Operator dashboard must refresh map markers every 2 seconds via WebSocket.",
    "FR3: System must send automated notifications to drivers when routes are updated.",
    "FR4: Users must be able to export reports in academic (IEEE) or business formats."
  ],
  nonFunctionalRequirements: [
    "NFR1: High availability - 99.9% uptime for API gateway.",
    "NFR2: Scalability - horizontal scaling of Celery workers using Docker/Kubernetes.",
    "NFR3: Security - OAuth2 JWT authentication with encryption at rest for location logs.",
    "NFR4: Low Latency - WebSocket message delivery under 100ms."
  ],
  targetAudience: "Fleet Owners, Logistics Coordinators, Dispatch Officers, Supply Chain Managers, and Delivery Developers.",
  businessUseCase: "Reduces last-mile delivery costs by up to 22%, increases driver output by 15%, and minimizes operational overhead by automating manual scheduling.",
  technicalUseCase: "Demonstrates a robust, decoupled microservices pattern combining high-performance Python ML services, real-time Node/FastAPI servers, and a responsive React frontend mapping network nodes.",
  technologyStack: {
    languages: ["Python", "JavaScript", "SQL", "HTML", "CSS"],
    frameworks: ["FastAPI", "React (Vite)", "Celery", "PyTorch"],
    databases: ["PostgreSQL", "Redis"],
    devops: ["Docker", "Docker Compose", "AWS ECS", "GitHub Actions"]
  },
  explanations: {
    executive: "SmartFleet combines deep learning models and combinatorial optimization algorithms to coordinate vehicle fleets in real-time, reducing delivery overhead by 22% using live traffic/weather data.",
    beginner: "Think of SmartFleet as an ultra-smart Google Maps for delivery trucks. Instead of just showing the fastest route for one car, it calculates the perfect route plan for an entire fleet of trucks, making sure every package gets delivered on time without wasting gas.",
    technical: "A decoupled React-FastAPI microservices architecture. Front-end coordinates maps and WebSockets. Back-end employs a FastAPI gateway with Celery workers. Optimization is handled using a hybrid Genetic Algorithm (GA) combined with PyTorch LSTM networks for travel-time estimations.",
    interview: "SmartFleet is a system designed to solve the NP-hard Vehicle Routing Problem under dynamic constraints. Developed a hybrid solver integrating a Genetic Algorithm with a PyTorch predictive model, decreasing delivery latency by 18% and scaling to 500 nodes via Redis queuing.",
    viva: "An implementation of the Capacitated Vehicle Routing Problem with Time Windows (CVRPTW). The thesis models dynamic traffic parameters as stochastic variables, utilizing an LSTM network for forecasting and a custom genetic algorithm for route optimization.",
    nonTechnical: "An automated scheduling tool that assigns jobs to drivers, outlines the best order of visits, tracks deliveries in real-time, and generates logistics reports for managers."
  },
  folderStructure: {
    name: "smartfleet",
    type: "directory",
    children: [
      {
        name: "backend",
        type: "directory",
        children: [
          {
            name: "app",
            type: "directory",
            children: [
              { name: "main.py", type: "file", language: "python", size: 1240 },
              { name: "routes.py", type: "file", language: "python", size: 3450 },
              { name: "optimizer.py", type: "file", language: "python", size: 5600 },
              { name: "route_model.py", type: "file", language: "python", size: 4120 }
            ]
          },
          { name: "Dockerfile", type: "file", language: "dockerfile", size: 450 },
          { name: "requirements.txt", type: "file", language: "text", size: 280 }
        ]
      },
      {
        name: "frontend",
        type: "directory",
        children: [
          {
            name: "src",
            type: "directory",
            children: [
              { name: "App.jsx", type: "file", language: "javascript", size: 2310 },
              { name: "MapDashboard.jsx", type: "file", language: "javascript", size: 6890 },
              { name: "useWebSockets.js", type: "file", language: "javascript", size: 1870 }
            ]
          },
          { name: "package.json", type: "file", language: "json", size: 980 }
        ]
      },
      { name: "docker-compose.yml", type: "file", language: "yaml", size: 750 }
    ]
  },
  files: {
    "backend/app/main.py": {
      code: `import uvicorn
from fastapi import FastAPI, Depends, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
from app.core.optimizer import RouteOptimizer
import redis

app = FastAPI(title="SmartFleet API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    app.state.redis_client = redis.Redis(host='redis', port=6379, db=0)
    app.state.optimizer = RouteOptimizer()
    print("SmartFleet Core Services initialized successfully.")

@app.websocket("/ws/fleet")
async def fleet_websocket(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connection established with client.")
    try:
        while True:
            # Receive coordinate updates from driver app
            data = await websocket.receive_json()
            vehicle_id = data.get("vehicle_id")
            lat, lon = data.get("lat"), data.get("lon")
            
            # Save latest location in Redis Cache
            app.state.redis_client.hset("fleet:locations", vehicle_id, f"{lat},{lon}")
            
            # Broadcast update back to dashboard
            await websocket.send_json({"status": "updated", "vehicle_id": vehicle_id, "lat": lat, "lon": lon})
    except Exception as e:
        print(f"WebSocket disconnected/error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)`,
      explanation: "This file is the main entry point of the FastAPI application. It configures CORS middleware, loads the REST API routes, initializes connection pools to Redis, loads the Machine Learning optimizer, and hosts the WebSocket endpoint `/ws/fleet` used for broadcasting real-time driver coordinates to the operator dashboard.",
      functions: [
        { name: "startup_event", desc: "Runs on API startup; establishes the Redis client pool and initializes the global RouteOptimizer class." },
        { name: "fleet_websocket", desc: "Manages persistent WebSocket sessions. Listens for incoming driver coordinates, logs them in Redis, and broadcasts live positions to dashboards." }
      ],
      classes: [],
      variables: [
        { name: "app", desc: "Instance of FastAPI serving all routes." },
        { name: "redis_client", desc: "Cached Redis connection handle." }
      ],
      apis: [
        { path: "/api/v1", method: "Router", desc: "Includes all modular sub-routes." },
        { path: "/ws/fleet", method: "WebSocket", desc: "Establishes real-time communication channel." }
      ],
      algorithm: "Event-driven asynchronous loop handling WebSockets.",
      logic: "Uses high-concurrency async-await protocols to handle multiple simultaneous WebSocket connections without blocking the main event thread.",
      dataFlow: "Driver GPS -> WebSocket Endpoint -> Redis Cache HSET -> Broadcast payload -> Dashboard Map View."
    },
    "backend/app/core/optimizer.py": {
      code: `import numpy as np
from app.models.route_model import TravelTimePredictor

class RouteOptimizer:
  def __init__(self):
    self.predictor = TravelTimePredictor()
    self.mutation_rate = 0.15
    self.population_size = 50
    self.generations = 100

  def calculate_distance_matrix(self, locations):
    n = len(locations)
    matrix = np.zeros((n, n))
    for i in range(n):
      for j in range(n):
        if i == j:
          matrix[i][j] = 0
        else:
          lat1, lon1 = locations[i]
          lat2, lon2 = locations[j]
          # Haversine distance formula
          d = self.haversine(lat1, lon1, lat2, lon2)
          # Predict dynamic travel time based on ML model
          matrix[i][j] = self.predictor.predict_time(d, hour=14)
    return matrix

  def haversine(self, lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a))
    return R * c

  def genetic_algorithm_solve(self, locations, vehicle_capacity, demands):
    # Initialize random population of routing tours
    population = [self.generate_random_tour(len(locations)) for _ in range(self.population_size)]
    distance_matrix = self.calculate_distance_matrix(locations)
    
    for gen in range(self.generations):
      # Evaluate fitness (1 / total_distance)
      fitness_scores = [1.0 / self.evaluate_tour(tour, distance_matrix, vehicle_capacity, demands) for tour in population]
      
      # Selection
      selected = self.selection_tournament(population, fitness_scores)
      
      # Crossover
      offspring = []
      for i in range(0, len(selected), 2):
        if i+1 < len(selected):
          child1, child2 = self.ordered_crossover(selected[i], selected[i+1])
          offspring.extend([child1, child2])
        else:
          offspring.append(selected[i])
          
      # Mutation
      population = [self.mutate(tour) for tour in offspring]
      
    # Return best tour found
    best_idx = np.argmax([1.0 / self.evaluate_tour(t, distance_matrix, vehicle_capacity, demands) for t in population])
    return population[best_idx]

  def generate_random_tour(self, size):
    tour = list(range(1, size))
    np.random.shuffle(tour)
    return [0] + tour + [0]

  def evaluate_tour(self, tour, matrix, capacity, demands):
    cost = 0
    current_load = 0
    for i in range(len(tour) - 1):
      from_node = tour[i]
      to_node = tour[i+1]
      cost += matrix[from_node][to_node]
      current_load += demands[to_node] if to_node < len(demands) else 0
      if current_load > capacity:
        cost += 10000  # High penalty for capacity violation
        current_load = 0
    return cost

  def selection_tournament(self, population, fitness, k=3):
    selected = []
    for _ in range(self.population_size):
      candidates = np.random.choice(len(population), k, replace=False)
      best_cand = candidates[np.argmax([fitness[c] for c in candidates])]
      selected.append(population[best_cand])
    return selected

  def ordered_crossover(self, parent1, parent2):
    size = len(parent1)
    child1 = [-1] * size
    child2 = [-1] * size
    
    # Keep depots (node 0) intact
    child1[0], child1[-1] = 0, 0
    child2[0], child2[-1] = 0, 0
    
    start, end = sorted(np.random.choice(range(1, size-1), 2, replace=False))
    child1[start:end] = parent1[start:end]
    
    p2_idx = 1
    for i in range(1, size-1):
      if child1[i] == -1:
        while parent2[p2_idx] in child1:
          p2_idx += 1
        child1[i] = parent2[p2_idx]
        
    # Same logic for child 2
    child2[start:end] = parent2[start:end]
    p1_idx = 1
    for i in range(1, size-1):
      if child2[i] == -1:
        while parent1[p1_idx] in child2:
          p1_idx += 1
        child2[i] = parent1[p1_idx]
        
    return child1, child2

  def mutate(self, tour):
    if np.random.rand() < self.mutation_rate:
      # Swap mutation (excluding start and end depot)
      idx1, idx2 = np.random.choice(range(1, len(tour)-1), 2, replace=False)
      tour[idx1], tour[idx2] = tour[idx2], tour[idx1]
    return tour`,
      explanation: "This file implements the core logistics optimization algorithms. It represents the Route Optimizer component of Module 2 and 3. It calculates a travel time distance matrix by combining standard distance formulas with predictions from the ML model, and solves the Vehicle Routing Problem using a customized Genetic Algorithm (GA).",
      functions: [
        { name: "calculate_distance_matrix", desc: "Computes the cost values between all locations using the Haversine formula and queries the PyTorch model for dynamic traffic predictions." },
        { name: "haversine", desc: "Calculates the great-circle distance between two geographic coordinates." },
        { name: "genetic_algorithm_solve", desc: "Core heuristics loop. Initializes tours, evaluates fitness with penalties, performs tournament selection, ordered crossovers, and swap mutations over 100 generations." },
        { name: "evaluate_tour", desc: "Calculates the total travel time cost of a route, penalizing heavily if vehicle capacity limits are violated." }
      ],
      classes: [
        { name: "RouteOptimizer", desc: "Orchestrates routing matrix calculations and runs the Genetic Algorithm solver." }
      ],
      variables: [
        { name: "mutation_rate", desc: "Probability of mutating a route tour (15%)." },
        { name: "population_size", desc: "Size of genetic optimization pool (50 candidate tours)." }
      ],
      apis: [],
      algorithm: "Hybrid Genetic Algorithm (Selection, Ordered Crossover, Swap Mutation) with Penalty Heuristics for CVRPTW.",
      logic: "Uses combinatorial genetics to search the route permutation space. Prevents invalid tours by maintaining depot boundaries at indices [0] and [-1] and applying a penalty scalar of 10,000 for capacity overflow.",
      dataFlow: "Location Coordinates & Vehicle Capacities -> Haversine/ML Matrix Constructor -> GA Solver Iterations -> Optimum Sequence Output."
    }
  },
  architecture: {
    hla: `graph TD
      subgraph Frontend
        Client[React operator dashboard]
      end
      
      subgraph API Gateway
        FastAPI[FastAPI Router]
      end
      
      subgraph Cache & Message Broker
        Redis[(Redis Cache)]
      end
      
      subgraph Background Optimizer
        Celery[Celery Optimizer Workers]
        PyTorch[PyTorch LSTM Prediction Model]
      end
      
      subgraph Persistent Database
        Postgres[(PostgreSQL DB)]
      end

      Client -->|REST Requests| FastAPI
      Client -->|WS Real-Time Tracking| FastAPI
      FastAPI -->|Check Locations| Redis
      FastAPI -->|Log Deliveries| Postgres
      FastAPI -->|Enqueue VRP jobs| Redis
      Redis -->|Process Queue| Celery
      Celery -->|Evaluate Travel Times| PyTorch
      Celery -->|Write optimized routes| Postgres`,
    lla: `classDiagram
      class App {
        +state.redis_client Redis
        +state.optimizer RouteOptimizer
        +startup_event()
        +fleet_websocket(WebSocket)
      }
      class RouteOptimizer {
        +predictor TravelTimePredictor
        +mutation_rate float
        +population_size int
        +calculate_distance_matrix(locations)
        +genetic_algorithm_solve(locations, capacity, demands)
        +evaluate_tour(tour, matrix, capacity, demands)
      }
      class TravelTimePredictor {
        +model PyTorchLSTM
        +predict_time(distance, hour)
      }
      App --> RouteOptimizer : uses
      RouteOptimizer --> TravelTimePredictor : invokes`,
    seq: `sequenceDiagram
      autonumber
      Client->>FastAPI: POST /api/v1/optimize (Locations, Capacities)
      FastAPI->>Redis: Enqueue optimization task
      Redis->>Celery: Pull VRP task
      Celery->>RouteOptimizer: Solve route sequence
      RouteOptimizer->>TravelTimePredictor: Predict time for coordinate pairs
      TravelTimePredictor-->>RouteOptimizer: Return predicted travel times
      RouteOptimizer-->>Celery: Return optimal route indexes
      Celery->>Postgres: Store final routes
      Celery-->>FastAPI: Publish optimization complete
      FastAPI-->>Client: Return JSON (Optimized Routes, ETAs)`
  },
  technologies: [
    {
      name: "Python",
      category: "Language",
      whyUsed: "Used for backend data processing and model orchestration due to its rich library ecosystem.",
      whyChosen: "Strong AI support, built-in numerical matrices (numpy), and high-quality web servers (FastAPI).",
      advantages: "Clean syntax, fast development speed, excellent integration with PyTorch.",
      disadvantages: "Slower execution speed compared to C++ or Rust for CPU-intensive tasks.",
      alternatives: "Go (better performance, poorer ML libraries), C++ (highly optimized, harder development cycle).",
      industry: "Data Science, Machine Learning, Web Backend Development.",
      practices: "Follow PEP-8, use virtual envs, implement type hints for API contracts.",
      updates: "Python 3.12 introduces sub-interpreters and faster startup allocations.",
      questions: [
        { q: "What is GIL and how does it affect multi-threading?", a: "The Global Interpreter Lock allows only one thread to control the Python interpreter. Use multiprocessing or async/await for I/O operations." },
        { q: "How do you optimize memory when handling large arrays?", a: "Use generator expressions or specialized libraries like numpy and pandas that operate outside the Python VM heap." }
      ]
    },
    {
      name: "React (Vite)",
      category: "Frontend",
      whyUsed: "Enables interactive dashboards, maps, and real-time graphs.",
      whyChosen: "Vite provides instantaneous Hot Module Replacement (HMR) and highly optimized production builds.",
      advantages: "Component-based architecture, extensive chart/map package support, speedy rendering.",
      disadvantages: "Client-side routing and state management requires careful hook definitions to avoid re-renders.",
      alternatives: "Vue.js (lighter weight), Next.js (better SEO, but heavy for single-page dashboard apps).",
      industry: "Single Page Apps, Dashboard portals, SaaS user interfaces.",
      practices: "Keep components small, use custom hooks for side effects (like WebSockets), prevent re-render loops.",
      updates: "React 19 brings Server Actions and compiler-level optimization rules.",
      questions: [
        { q: "What is the difference between useMemo and useCallback?", a: "useMemo caches the returned value of a function, while useCallback caches the actual function reference." }
      ]
    },
    {
      name: "PyTorch",
      category: "AI/ML",
      whyUsed: "Used for travel time regression and dynamic congestion predictions.",
      whyChosen: "Dynamic computation graph makes PyTorch highly debuggable and convenient during neural net training.",
      advantages: "Pythonic structure, strong GPU acceleration, huge developer community.",
      disadvantages: "Harder to deploy to edge devices compared to TensorFlow Lite.",
      alternatives: "TensorFlow, Keras.",
      industry: "Self-Driving Vehicles, NLP, Computer Vision, Route Prediction.",
      practices: "Utilize DataLoader class for batching, call .detach() when extracting evaluation scalars.",
      updates: "PyTorch 2.0 introduces torch.compile for massive graph speedups.",
      questions: [
        { q: "How do you prevent overfitting in an LSTM?", a: "Apply dropout layers between recurrent nodes and use early stopping with validation loss metrics." }
      ]
    }
  ],
  liveSearch: {
    query: "Explain Agentic AI in logistics",
    steps: [
      "Sending request to web research agents...",
      "Crawling technical blogs on logistics optimization...",
      "Analyzing StackOverflow and GitHub repos with custom agent systems...",
      "Summarizing verified papers..."
    ],
    summary: "Agentic AI in logistics refers to the deployment of autonomous software agents that can reason, make decisions, and take actions over supply chains. Unlike static routing algorithms that just compute numbers, Agentic AI continuously monitors external APIs, communicates with drivers, re-allocates warehouse stocks, and handles exceptions (like vehicle breakdown) autonomously.",
    citations: [
      { title: "DeepMind Supply Chain Research", url: "https://deepmind.google/logistics-agents" },
      { title: "IEEE Transactions on Intelligent Transportation Systems", url: "https://ieee.org/transport-systems-agents" }
    ]
  },
  projectSpecificLearning: [
    {
      tech: "Redis",
      projectUsage: "Acts as a temporary data store for dynamic vehicle location logs. Also manages the celery queue tasks.",
      generalUsage: "Highly deployed for caching HTTP sessions, counting access rates (rate limiting), and real-time game leaderboards."
    },
    {
      tech: "WebSockets",
      projectUsage: "Coordinates active connection links between the dispatch dashboard and the delivery vehicles.",
      generalUsage: "Used in chat rooms, stock market trackers, multiplayer gaming, and anywhere dynamic data updates are frequent."
    }
  ],
  documentation: {
    readme: `# SmartFleet - AI Route Optimizer\n\nSmartFleet is an enterprise-grade vehicle routing system.\n\n## Setup\n1. Run \`docker-compose up\`\n2. Open \`http://localhost:5173\`\n\n## Technical Core\nGenetic Algorithms predict travel matrices and plan route paths.`,
    abstract: "The Vehicle Routing Problem (VRP) is a fundamental bottleneck in modern delivery systems. This project presents SmartFleet, a dynamic, real-time optimization system integrating deep LSTM models for travel time forecasts and a customized Genetic Algorithm for fleet schedule mapping. Results show a 22% decrease in operations costs.",
    installation: "To install SmartFleet locally, make sure you have Docker installed.\n\n```bash\ngit clone https://github.com/logistics/smartfleet.git\ncd smartfleet\ndocker-compose up --build\n```\nThe backend will spin up on port 8000, and frontend will boot on 5173.",
    api: "### API Endpoints\n\n- **POST /api/v1/optimize**:\n  - Input: Array of geo-coordinates, capacity limits, demands.\n  - Output: Array of optimized vehicle paths.\n\n- **WS /ws/fleet**:\n  - Interactive WebSocket for driver updates."
  },
  questions: {
    beginner: [
      { q: "What does the SmartFleet platform do?", a: "It helps delivery companies find the best path for multiple delivery vehicles so that they save fuel and deliver items on time." },
      { q: "What is a database?", a: "An organized storage area. SmartFleet uses PostgreSQL to keep records of previous routes and driver logs." }
    ],
    intermediate: [
      { q: "Why did we choose Redis instead of PostgreSQL for GPS logs?", a: "GPS coordinates change constantly (every 2-3 seconds). Writing these directly to PostgreSQL would create a bottleneck. Redis is an in-memory database capable of handling millions of writes per second." },
      { q: "Explain the Haversine formula.", a: "It calculates the shortest distance between two points on the surface of a sphere using their latitude and longitude." }
    ],
    advanced: [
      { q: "How does the Genetic Algorithm avoid local minima in routing?", a: "By tuning mutation rates (e.g. 15%) and performing tournament selections, we maintain diversity. In addition, the Ordered Crossover ensures valid tours are formed." },
      { q: "How do you handle WebSocket connection drops in React?", a: "By implementing a custom hook with back-off retry algorithms. If the socket crashes, the frontend attempts to reconnect after 1s, 2s, 4s, etc." }
    ],
    viva: {
      twoMarks: [
        { q: "What is CVRPTW?", a: "Capacitated Vehicle Routing Problem with Time Windows. It represents an NP-hard problem where routes must respect vehicle load limits and delivery deadlines." }
      ],
      fiveMarks: [
        { q: "Describe the crossover operator used in this project.", a: "We use Ordered Crossover (OX1). It preserves the relative order of locations from parent 1 in a randomly chosen subset, and fills the remaining slots using locations from parent 2 without duplication." }
      ],
      tenMarks: [
        { q: "Analyze the architecture of the SmartFleet optimization pipeline.", a: "The architecture is split into a user dashboard, an API gateway, a Redis broker, and Celery optimizer workers. First, coordinates are sent to FastAPI. FastAPI delegates VRP jobs to Redis. Celery workers fetch tasks, calculate distances using Haversine, query a PyTorch LSTM model for traffic forecasts, and execute the Genetic Algorithm. The result is cached in Postgres and returned to the UI." }
      ]
    }
  },
  bugs: [
    {
      id: "BUG-101",
      type: "Performance / Memory",
      title: "PyTorch Tensor Accumulation Memory Leak",
      description: "During prediction loops, travel time prediction tensors are loaded to RAM without detaching the gradients, causing memory to build up until the system runs out of memory (OOM).",
      rootCause: "Calling `predictor.predict_time()` without wrapping the forward pass inside a `with torch.no_grad():` block.",
      diff: `-    prediction = self.model(input_tensor)
-    return prediction.item()
+    with torch.no_grad():
+        prediction = self.model(input_tensor)
+        return prediction.item()`,
      fix: "Wrap the inference forward pass in `torch.no_grad()` context to disable gradient tracking and free graph structures.",
      optimized: "Use TorchScript compiled models for rapid inference in multi-threaded workers."
    },
    {
      id: "BUG-102",
      type: "Security / SQL",
      title: "Potential SQL Injection in Fleet Logs Query",
      description: "Direct string formatting used in PostgreSQL log queries allows injection of raw database commands.",
      rootCause: "Using f-strings inside dynamic DB executors.",
      diff: `-    cursor.execute(f"SELECT * FROM logs WHERE vehicle_id = '{vehicle_id}'")
+    cursor.execute("SELECT * FROM logs WHERE vehicle_id = %s", (vehicle_id,))`,
      fix: "Use parameterized queries passing inputs as arguments to let psycopg2 escape characters.",
      optimized: "Leverage SQL Alchemy ORM for type-safe schema queries."
    }
  ],
  improvements: [
    {
      title: "Real-Time Weather Integration",
      impact: "High",
      type: "New Feature",
      description: "Integrate OpenWeather API inside travel time predictions to alter routing costs dynamically during heavy rain or snow."
    },
    {
      title: "Apache Kafka Event streaming",
      impact: "Medium",
      type: "Infrastructure",
      description: "Replace standard WebSockets route tracking with a Kafka event stream to enable robust ingestion of GPS streams."
    },
    {
      title: "Driver UI dark mode",
      impact: "Low",
      type: "UI / UX",
      description: "Add theme switcher for drivers delivering cargo during night shifts."
    }
  ],
  socials: {
    resume: "* Developed SmartFleet, an AI-powered fleet optimizer using FastAPI and React, which decreased delivery times by 22%.\n* Scaled VRP calculations to 500 coordinates using Celery workers, Redis, and multi-threaded Genetic Algorithms.\n* Engineered PyTorch LSTM travel-time predictor leading to a 15% increase in ETA accuracy.",
    linkedin: "🚀 Excited to share my latest project: SmartFleet! 🚚\n\nIt is an AI-powered logistics router that combines Genetic Algorithms with PyTorch LSTM predictions to schedule deliveries in real-time. By dynamically routing fleets around traffic bottlenecks, it cuts operations overhead by 22%!\n\nCheck out the demo showing WebSockets routing and Canvas dependency graphs below! #reactjs #python #pytorch #logistics #ai",
    github: "SmartFleet is a dynamic fleet logistics solver. Features include a React UI mapping active nodes, a FastAPI server orchestrating Redis/Celery worker queues, and a PyTorch regressor forecasting travel times.",
    portfolio: "SmartFleet is a system engineered to solve the Capacitated Vehicle Routing Problem. It incorporates combinatorial genetic searches with neural networks to coordinate commercial fleets in real-time."
  },
  careerRoadmap: {
    roles: ["Logistics Software Engineer", "Backend Developer", "Optimization Scientist", "Data Engineer"],
    skills: ["Dynamic Programming", "Integer Programming", "React Hooks", "Celery Queues", "Redis Operations"],
    missing: ["Docker Swarm / Kubernetes", "Kafka Stream Processing", "PostgreSQL PostGIS extension"],
    roadmap: [
      { step: "1. Advanced Algorithms", desc: "Master branch-and-cut algorithms for linear optimization." },
      { step: "2. GIS Frameworks", desc: "Learn PostGIS to handle spatial geospatial databases." },
      { step: "3. DevOps & Scale", desc: "Deploy Celery workers inside Docker Swarm across multiple servers." }
    ]
  },
  research: {
    papers: [
      { title: "A Deep Reinforcement Learning approach to Vehicle Routing", authors: "Li et al., 2023", journal: "Journal of Artificial Intelligence Research", abstract: "Proposes an encoder-decoder attention model that outputs route sequences, yielding faster runtimes than standard heuristics." }
    ],
    trends: "Logistics industry is shifting from static genetic algorithms to real-time agentic reinforcement learning architectures which dynamically negotiate coordinates.",
    competitors: "Existing services (e.g. OptimoRoute, Route4Me) are expensive SaaS programs. SmartFleet provides a flexible self-hosted framework suited for specific microservice templates."
  },
  knowledgeGraph: {
    nodes: [
      { id: "main.py", group: "backend", label: "main.py (Server Entry)" },
      { id: "routes.py", group: "backend", label: "routes.py (Endpoints)" },
      { id: "optimizer.py", group: "backend", label: "optimizer.py (GA Solver)" },
      { id: "route_model.py", group: "backend", label: "route_model.py (LSTM)" },
      { id: "App.jsx", group: "frontend", label: "App.jsx (Main View)" },
      { id: "MapDashboard.jsx", group: "frontend", label: "MapDashboard.jsx (UI Map)" },
      { id: "useWebSockets.js", group: "frontend", label: "useWebSockets.js (WS Hook)" },
      { id: "Redis", group: "database", label: "Redis Cache" },
      { id: "PostgreSQL", group: "database", label: "PostgreSQL" }
    ],
    links: [
      { source: "main.py", target: "routes.py" },
      { source: "routes.py", target: "optimizer.py" },
      { source: "optimizer.py", target: "route_model.py" },
      { source: "main.py", target: "Redis" },
      { source: "App.jsx", target: "useWebSockets.js" },
      { source: "App.jsx", target: "MapDashboard.jsx" },
      { source: "useWebSockets.js", target: "main.py" },
      { source: "optimizer.py", target: "PostgreSQL" }
    ]
  },
  healthScores: {
    quality: 85,
    security: 78,
    scalability: 82,
    maintainability: 88,
    documentation: 90,
    readiness: 84,
    iq: 84
  },
  presentation: [
    { title: "SmartFleet: AI Logistics Optimizer", bullets: ["Real-Time route generation", "Hybrid GA & PyTorch architecture", "Cuts fuel costs by 22%"], notes: "Welcome the audience. Introduce the core bottlenecks in logistics (22% waste) and outline how SmartFleet addresses this." },
    { title: "The Routing Problem (CVRPTW)", bullets: ["NP-Hard combinatorial challenge", "Fleet capacity limits constraints", "Dynamic arrival time windows"], notes: "Explain CVRPTW. Note that static solutions fail when traffic updates trigger routing delays." },
    { title: "System Architecture", bullets: ["Decoupled React dashboard", "FastAPI endpoint broker", "Celery worker cluster + Redis"], notes: "Point to the HLA diagram. Emphasize that long-running GA optimizations are delegated to background worker threads." }
  ]
};
