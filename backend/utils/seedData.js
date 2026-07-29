const User = require("../models/User");
const Event = require("../models/Event");
const Team = require("../models/Team");
const Submission = require("../models/Submission");
const Score = require("../models/Score");

const seedDatabase = async () => {
  try {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount === 0) {
      console.log("Seeding default admin and sample data...");

      // 1. Create Admin
      const admin = await User.create({
        name: "Platform Admin",
        email: "admin@hackathon.com",
        password: "adminpassword123",
        role: "admin",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin",
        bio: "Lead System Administrator & Hackathon Overseer",
        skills: ["System Admin", "Governance", "DevOps"],
      });

      // 2. Create Organizer
      const organizer = await User.create({
        name: "Sarah Jenkins",
        email: "organizer@hackathon.com",
        password: "organizerpassword123",
        role: "organizer",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sarah",
        bio: "Global Tech Event Lead & Hackathon Director",
        skills: ["Event Management", "Developer Relations"],
      });

      // 3. Create Judges
      const judge1 = await User.create({
        name: "Dr. Alex Vance",
        email: "judge1@hackathon.com",
        password: "judgepassword123",
        role: "judge",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
        bio: "AI Research Scientist & Venture Partner",
        skills: ["Machine Learning", "System Architecture"],
      });

      const judge2 = await User.create({
        name: "Elena Rostova",
        email: "judge2@hackathon.com",
        password: "judgepassword123",
        role: "judge",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Elena",
        bio: "VP of Product Engineering",
        skills: ["UX Design", "Full Stack Development"],
      });

      // 4. Create Participants
      const participant1 = await User.create({
        name: "Neeraj Kashyap",
        email: "participant1@hackathon.com",
        password: "participantpassword123",
        role: "participant",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Neeraj",
        bio: "Full Stack Engineer & AI Enthusiast",
        skills: ["React", "Node.js", "MongoDB", "Python"],
      });

      const participant2 = await User.create({
        name: "Aria Chen",
        email: "participant2@hackathon.com",
        password: "participantpassword123",
        role: "participant",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aria",
        bio: "Frontend Developer & UI/UX Specialist",
        skills: ["React", "Tailwind CSS", "Figma"],
      });

      // 5. Create Hackathons
      const hackathon1 = await Event.create({
        title: "HackSphere 2026: AI & Cloud Innovation",
        tagline: "Build Next-Gen Autonomous AI Applications & Distributed Cloud Solutions",
        theme: "Artificial Intelligence & Cloud Computing",
        description:
          "HackSphere 2026 brings together top engineers, researchers, and innovators from across the globe for an intense 48-hour challenge. Build game-changing solutions leveraging Generative AI, LLMs, and real-time cloud architectures.",
        rules:
          "1. Code must be written during the hackathon timeframe.\n2. Projects must include an open GitHub repository with README.\n3. All team members must be registered on the platform.\n4. Maximum 4 members per team.",
        mode: "Online",
        venue: "Virtual Global Discord & Platform Live Stream",
        bannerImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        prizePool: "$25,000 USD",
        maxTeamSize: 4,
        registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        submissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        status: "ongoing",
        registrationOpen: true,
        judgingCriteria: [
          { name: "Innovation", maxScore: 10 },
          { name: "Technical Complexity", maxScore: 10 },
          { name: "User Interface", maxScore: 10 },
          { name: "Functionality", maxScore: 10 },
          { name: "Scalability", maxScore: 10 },
          { name: "Documentation", maxScore: 10 },
          { name: "Presentation", maxScore: 10 },
        ],
      });

      const hackathon2 = await Event.create({
        title: "DevBattle: Web3 & Decentralized Systems",
        tagline: "Pioneer the Future of Decentralized Finance & Zero-Knowledge Security",
        theme: "Blockchain & Decentralized Web",
        description:
          "DevBattle challenges developers to engineer high-throughput dApps, decentralized storage solutions, and zero-knowledge privacy protocols.",
        rules: "Standard open-source guidelines apply.",
        mode: "Offline",
        venue: "Tech Innovation Hub, San Francisco / Bangalore",
        bannerImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
        prizePool: "$15,000 USD",
        maxTeamSize: 3,
        registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        submissionDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        status: "upcoming",
        registrationOpen: true,
      });

      // 6. Create Teams
      const team1 = await Team.create({
        name: "Neural Force",
        inviteCode: "NEURAL",
        leader: participant1._id,
        members: [participant1._id, participant2._id],
        hackathon: hackathon1._id,
        assignedJudges: [judge1._id, judge2._id],
        status: "approved",
      });

      // 7. Create Submission
      const submission1 = await Submission.create({
        team: team1._id,
        hackathon: hackathon1._id,
        title: "Antigravity AI: Real-Time Collaborative Coding Copilot",
        problemStatement:
          "Existing developer tools lack instant contextual awareness across multi-file repositories and distributed developer teams.",
        solution:
          "Antigravity AI connects developer IDEs to a distributed agent network, automating refactoring, multi-criteria test verification, and auto-documenting pull requests.",
        description:
          "Antigravity AI is an autonomous, agentic coding platform built with React, Node.js, Express, MongoDB, and modern neural reasoning pipelines.",
        repoLink: "https://github.com/example/antigravity-ai",
        demoLink: "https://antigravity-ai-demo.vercel.app",
        techStack: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "WebSocket"],
        screenshots: [
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
        ],
        presentationPdf: "https://example.com/pitch-deck.pdf",
        demoVideoLink: "https://youtube.com/watch?v=demo123",
        submittedBy: participant1._id,
        status: "under_review",
      });

      // 8. Create Scores
      await Score.create({
        team: team1._id,
        hackathon: hackathon1._id,
        judge: judge1._id,
        innovation: 9,
        technicalComplexity: 9,
        userInterface: 10,
        functionality: 9,
        scalability: 8,
        documentation: 9,
        presentation: 9,
        feedback: "Outstanding work! Exceptional code structure, smooth UI, and clear presentation.",
      });

      console.log("Seeding completed successfully!");
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
};

module.exports = seedDatabase;
