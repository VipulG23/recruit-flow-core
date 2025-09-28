import { createServer, Model, Factory, belongsTo, hasMany, Response } from "miragejs";
// Using built-in crypto for fake data generation since faker dependency issue
const generateId = () => crypto.randomUUID();
const generateName = () => {
  const firstNames = ["John", "Jane", "Alex", "Sarah", "Mike", "Emily", "David", "Lisa", "Tom", "Anna"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
  return {
    first: firstNames[Math.floor(Math.random() * firstNames.length)],
    last: lastNames[Math.floor(Math.random() * lastNames.length)]
  };
};
const generateEmail = (firstName: string, lastName: string) => 
  `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const generateText = (sentences = 1) => {
  const words = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do"];
  return Array.from({ length: sentences }, () => 
    Array.from({ length: randomInt(8, 15) }, () => randomElement(words)).join(" ")
  ).join(". ") + ".";
};

// Job stages for candidate pipeline
export const JOB_STAGES = [
  { id: "applied", name: "Applied", color: "#3B82F6" },
  { id: "screening", name: "Phone Screening", color: "#8B5CF6" },
  { id: "interview", name: "Interview", color: "#F59E0B" },
  { id: "assessment", name: "Assessment", color: "#EF4444" },
  { id: "final", name: "Final Interview", color: "#10B981" },
  { id: "offer", name: "Offer", color: "#059669" },
  { id: "hired", name: "Hired", color: "#065F46" },
  { id: "rejected", name: "Rejected", color: "#6B7280" },
];

export const JOB_STATUSES = [
  { value: "active", label: "Active", color: "#10B981" },
  { value: "paused", label: "Paused", color: "#F59E0B" },
  { value: "closed", label: "Closed", color: "#6B7280" },
  { value: "draft", label: "Draft", color: "#8B5CF6" },
];

export function createMockServer() {
  return createServer({
    models: {
      job: Model.extend({
        candidates: hasMany(),
      }),
      candidate: Model.extend({
        job: belongsTo(),
      }),
      assessment: Model.extend({}),
    },

    factories: {
      job: Factory.extend({
        title() {
          const roles = [
            "Senior Software Engineer",
            "Product Manager", 
            "UX Designer",
            "Data Scientist",
            "DevOps Engineer",
            "Frontend Developer",
            "Backend Developer",
            "Marketing Manager",
            "Sales Representative",
            "Customer Success Manager",
            "QA Engineer",
            "Technical Writer",
          ];
          return randomElement(roles);
        },
        department() {
          return randomElement([
            "Engineering", "Product", "Design", "Data", "Marketing", "Sales", "Support"
          ]);
        },
        location() {
          return randomElement([
            "Remote", "San Francisco", "New York", "London", "Berlin", "Toronto"
          ]);
        },
        type() {
          return randomElement(["Full-time", "Part-time", "Contract", "Intern"]);
        },
        status() {
          return randomElement(JOB_STATUSES.map(s => s.value));
        },
        description() {
          return generateText(3);
        },
        requirements() {
          return Array.from({ length: randomInt(3, 8) }, () =>
            "Experience with " + randomElement(["React", "Node.js", "Python", "AWS", "Docker", "TypeScript"])
          );
        },
        salary() {
          return {
            min: randomInt(60000, 120000),
            max: randomInt(120000, 200000),
            currency: "USD",
          };
        },
        createdAt() {
          return new Date(Date.now() - randomInt(0, 90 * 24 * 60 * 60 * 1000));
        },
        updatedAt() {
          return new Date(Date.now() - randomInt(0, 30 * 24 * 60 * 60 * 1000));
        },
        priority() {
          return randomElement(["low", "medium", "high", "urgent"]);
        },
        hiringManager() {
          const name = generateName();
          return {
            id: generateId(),
            name: `${name.first} ${name.last}`,
            email: generateEmail(name.first, name.last),
            avatar: `https://images.unsplash.com/photo-${randomInt(1500000000000, 1600000000000)}?w=40&h=40&fit=crop&crop=face`,
          };
        },
      }),

      candidate: Factory.extend({
        firstName() {
          return generateName().first;
        },
        lastName() {
          return generateName().last;
        },
        email() {
          const name = generateName();
          return generateEmail(name.first, name.last);
        },
        phone() {
          return `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
        },
        avatar() {
          return `https://images.unsplash.com/photo-${randomInt(1500000000000, 1600000000000)}?w=40&h=40&fit=crop&crop=face`;
        },
        location() {
          const cities = ["New York, NY", "San Francisco, CA", "Austin, TX", "Seattle, WA", "Boston, MA"];
          return randomElement(cities);
        },
        experience() {
          return randomInt(0, 15);
        },
        currentRole() {
          const roles = ["Software Engineer", "Product Manager", "Designer", "Data Analyst"];
          return randomElement(roles);
        },
        currentCompany() {
          const companies = ["TechCorp", "InnovateCo", "DataSoft", "CloudTech", "StartupXYZ"];
          return randomElement(companies);
        },
        stage() {
          return randomElement(JOB_STAGES.map(s => s.id));
        },
        appliedAt() {
          return new Date(Date.now() - randomInt(0, 60 * 24 * 60 * 60 * 1000));
        },
        lastActivity() {
          return new Date(Date.now() - randomInt(0, 7 * 24 * 60 * 60 * 1000));
        },
        rating() {
          return randomInt(1, 5);
        },
        notes() {
          return generateText(1);
        },
        skills() {
          const allSkills = ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "GraphQL", "MongoDB"];
          return Array.from({ length: randomInt(3, 10) }, () => randomElement(allSkills));
        },
        resumeUrl() {
          return "https://example.com/resume.pdf";
        },
        linkedinUrl() {
          return `https://linkedin.com/in/user${randomInt(1000, 9999)}`;
        },
        source() {
          return randomElement([
            "LinkedIn", "Indeed", "Company Website", "Referral", "Glassdoor", "AngelList"
          ]);
        },
      }),

      assessment: Factory.extend({
        title() {
          return randomElement([
            "Technical Screening",
            "Coding Challenge", 
            "System Design",
            "Behavioral Interview",
            "Take-home Project",
            "Cultural Fit Assessment",
          ]);
        },
        description() {
          return generateText(1);
        },
        type() {
          return randomElement(["quiz", "coding", "essay", "interview"]);
        },
        duration() {
          return randomInt(15, 180);
        },
        questions() {
          return Array.from({ length: randomInt(5, 15) }, (_, i) => ({
            id: i + 1,
            type: randomElement(["multiple-choice", "text", "code", "rating"]),
            question: generateText(1).replace(".", "?"),
            required: Math.random() > 0.3,
            options: Math.random() > 0.5 ? 
              Array.from({ length: 4 }, () => generateText(1).split(" ").slice(0, 3).join(" ")) : undefined,
          }));
        },
        createdAt() {
          return new Date(Date.now() - randomInt(0, 30 * 24 * 60 * 60 * 1000));
        },
        status() {
          return randomElement(["draft", "active", "paused", "archived"]);
        },
      }),
    },

    seeds(server) {
      // Create jobs
      const jobs = server.createList("job", 25);
      
      // Create candidates for each job
      jobs.forEach((job: any) => {
        const candidateCount = randomInt(5, 40);
        server.createList("candidate", candidateCount, { job });
      });

      // Create assessments
      server.createList("assessment", 12);
    },

    routes() {
      this.namespace = "api";
      this.timing = 400; // Simulate network latency

      // Jobs routes
      this.get("/jobs", (schema: any) => {
        // Simulate occasional errors
        if (Math.random() < 0.05) {
          return new Response(500, {}, { error: "Server error" });
        }
        return schema.jobs.all();
      });

      this.get("/jobs/:id", (schema: any, request) => {
        const id = request.params.id;
        const job = schema.jobs.find(id);
        
        if (!job) {
          return new Response(404, {}, { error: "Job not found" });
        }

        return {
          job: job.attrs,
          candidates: job.candidates.models.map((c: any) => c.attrs),
        };
      });

      this.post("/jobs", (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.jobs.create({
          ...attrs,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      this.patch("/jobs/:id", (schema: any, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        const job = schema.jobs.find(id);
        
        if (!job) {
          return new Response(404, {}, { error: "Job not found" });
        }

        return job.update({ ...attrs, updatedAt: new Date() });
      });

      this.delete("/jobs/:id");

      // Candidates routes
      this.get("/candidates", (schema: any, request) => {
        const queryParams = request.queryParams || {};
        const { jobId, stage, search } = queryParams;
        const page = parseInt(queryParams.page as string) || 1;
        const limit = parseInt(queryParams.limit as string) || 50;
        
        let candidates = schema.candidates.all();

        if (jobId) {
          candidates = candidates.filter((c: any) => c.job?.id === jobId);
        }

        if (stage) {
          candidates = candidates.filter((c: any) => c.stage === stage);
        }

        if (search && typeof search === 'string') {
          const searchLower = search.toLowerCase();
          candidates = candidates.filter((c: any) => 
            c.firstName.toLowerCase().includes(searchLower) ||
            c.lastName.toLowerCase().includes(searchLower) ||
            c.email.toLowerCase().includes(searchLower)
          );
        }

        // Pagination
        const offset = (page - 1) * limit;
        const paginatedCandidates = candidates.models.slice(offset, offset + limit);

        return {
          candidates: paginatedCandidates.map((c: any) => c.attrs),
          pagination: {
            page,
            limit,
            total: candidates.models.length,
            totalPages: Math.ceil(candidates.models.length / limit),
          },
        };
      });

      this.get("/candidates/:id");
      this.patch("/candidates/:id");

      // Assessments routes
      this.get("/assessments");
      this.get("/assessments/:id");
      this.post("/assessments");
      this.patch("/assessments/:id");
      this.delete("/assessments/:id");

      // Assessment responses
      this.post("/assessments/:id/responses", (schema: any, request) => {
        const assessmentId = request.params.id;
        const response = JSON.parse(request.requestBody);
        
        // In a real app, you'd save this to a responses table
        return new Response(201, {}, { 
          id: generateId(),
          assessmentId,
          candidateId: response.candidateId,
          responses: response.responses,
          submittedAt: new Date(),
          score: randomInt(60, 100),
        });
      });

    },
  });
}