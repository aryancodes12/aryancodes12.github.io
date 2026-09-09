/**
 * data.js — Portfolio Content for Aryan Gupta's 3D Universe
 * Single source of truth for all displayed content.
 */

window.UNIVERSE_DATA = {

  personal: {
    name: "Aryan Gupta",
    title: "B.Sc. Data Science & AI Student",
    bio: "I'm Aryan Gupta, a B.Sc. Data Science & AI student passionate about technology, artificial intelligence, and problem-solving. I enjoy working with Python, data analysis, machine learning, and backend development. I'm constantly learning new technologies and building practical projects to strengthen my skills. My goal is to create useful, innovative solutions while growing as a developer and data professional.",
    photo: "asset/aryan.webp",
    github: "https://github.com/aryancodes12",
    linkedin: "https://www.linkedin.com/in/aryan-rajesh-gupta-386449360/",
    email: "aryansynthh@gmail.com",
    resume: "asset/Aryan_Rajesh_Gupta_Resume.pdf"
  },

  // 6 Navigation nodes arranged in a circle of radius 5
  nodes: [
    { id: "about",      label: "About",      color: 0x4a90e2, glowColor: "#4a90e2", angle: 0,   radius: 5, y:  0.5  },
    { id: "skills",     label: "Skills",     color: 0xa855f7, glowColor: "#a855f7", angle: 60,  radius: 5, y: -0.8  },
    { id: "projects",   label: "Projects",   color: 0xf97316, glowColor: "#f97316", angle: 120, radius: 5, y:  1.0  },
    { id: "experience", label: "Experience", color: 0xeab308, glowColor: "#eab308", angle: 180, radius: 5, y: -0.3  },
    { id: "education",  label: "Education",  color: 0x22c55e, glowColor: "#22c55e", angle: 240, radius: 5, y:  0.7  },
    { id: "contact",    label: "Contact",    color: 0xef4444, glowColor: "#ef4444", angle: 300, radius: 5, y: -0.5  }
  ],

  // 5 Project planets — orbit the "Projects" node
  projects: [
    {
      id: "gearbox",
      name: "Gearbox Failure Prediction",
      description: "Machine learning model predicting gearbox failure from load, temperature, vibration, and oil level.",
      tech: ["Python", "Pandas", "Scikit-learn", "joblib", "Streamlit"],
      link: "https://gearbox-failure-prediction-model.streamlit.app/",
      linkText: "Live Demo",
      color: 0xff6b35,
      orbitRadius: 1.6,
      orbitSpeed: 0.45,
      size: 0.22,
      featured: true
    },
    {
      id: "auth",
      name: "Authentication System",
      description: "Secure authentication system with login, registration, password hashing, and session management.",
      tech: ["Python", "MySQL", "Security"],
      link: "https://github.com/aryancodes12/authentication-system",
      linkText: "View Repository",
      color: 0x3b82f6,
      orbitRadius: 2.3,
      orbitSpeed: 0.3,
      size: 0.18
    },
    {
      id: "synthalytics",
      name: "Synthalytics",
      description: "Data analytics tool for synthesizing and visualizing complex datasets with intuitive dashboards.",
      tech: ["Python", "Pandas", "Matplotlib"],
      link: "https://github.com/aryancodes12/Synthalytics",
      linkText: "View Repository",
      color: 0xa855f7,
      orbitRadius: 3.1,
      orbitSpeed: 0.2,
      size: 0.20
    },
    {
      id: "taskcli",
      name: "Task Manager CLI",
      description: "Command-line task manager in Python with CRUD operations, priority setting, and persistent storage.",
      tech: ["Python", "CLI", "JSON"],
      link: "https://github.com/aryancodes12/Task-manager-CLI",
      linkText: "View Repository",
      color: 0x22c55e,
      orbitRadius: 3.9,
      orbitSpeed: 0.14,
      size: 0.16
    },
    {
      id: "pymysql",
      name: "PyMySQL Practice",
      description: "Python-MySQL integration project with CRUD operations, stored procedures, and database management exercises.",
      tech: ["Python", "MySQL", "Database"],
      link: "https://github.com/aryancodes12/PyMySQL-Python-Practice",
      linkText: "View Repository",
      color: 0xf59e0b,
      orbitRadius: 4.7,
      orbitSpeed: 0.09,
      size: 0.14
    }
  ],

  // 3 Skill constellation clusters
  skills: {
    core: {
      label: "Core",
      color: "#4a90e2",
      items: ["Python", "MySQL", "R", "Git", "GitHub", "HTML", "CSS"]
    },
    dataScience: {
      label: "Data Science",
      color: "#a855f7",
      items: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "EDA", "Data Cleaning", "Statistics"]
    },
    learning: {
      label: "Learning",
      color: "#22c55e",
      items: ["DSA", "Scikit-Learn", "Machine Learning"]
    }
  },

  experience: [
    {
      role: "IT Intern",
      company: "Awdiz Institute",
      period: "August 2026",
      description: "Worked on data analysis and visualization projects. Implemented machine learning models for predictive analytics. Collaborated with cross-functional teams to deliver insights for business decisions."
    }
  ],

  education: [
    {
      degree: "B.Sc. Data Science & AI",
      institution: "Bhavan's College",
      period: "2025 – 2028 (Expected)",
      description: "Pursuing a degree in Data Science and Artificial Intelligence with focus on machine learning, data analytics, and software development."
    },
    {
      degree: "Junior College",
      institution: "R.D. & S.H. National College",
      period: "2023 – 2025",
      description: "Completed junior college education with a focus on science and mathematics."
    }
  ]
};
