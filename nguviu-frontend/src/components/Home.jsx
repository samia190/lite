import { useEffect, useState, useRef } from "react";
import LazyImage from "./LazyImage";
import OptimizedImage from "./OptimizedImage";
import OptimizedVideo from "./OptimizedVideo";
import { get, patch } from "../utils/api";
import EditableHeading from "../components/EditableHeading";
import EditableText from "../components/EditableText";
import { safePath } from "../utils/paths";

export default function Home({ user, setRoute }) {
  const [content, setContent] = useState({});
  const [error, setError] = useState("");
  const [bgContent, setBgContent] = useState(null);
  const [bgIndex, setBgIndex] = useState(0);
  const bgTimerRef = useRef(null);
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    get("/api/content/home")
      .then((data) => setContent(data || {}))
      .catch(() => setError("Failed to load home page content."));

    // fetch page backgrounds
    get("/api/content/page-backgrounds")
      .then((data) => setBgContent(data || null))
      .catch(() => {});

    // fetch summaries for quick sections
    fetchSummaries();

    return () => {
      if (bgTimerRef.current) clearInterval(bgTimerRef.current);
    };
  }, []);

  async function fetchSummaries() {
    try {
      const keys = ["about", "admissions", "curriculum", "staff", "gallery", "contact"];
      const results = await Promise.all(
        keys.map((k) => get(`/api/content/summary/${k}`).catch(() => null))
      );
      const map = {};
      keys.forEach((k, i) => {
        if (results[i]) map[k] = results[i];
      });
      setSummaries(map);
    } catch (err) {
      // ignore errors fetching small summaries
    }
  }

  async function updateSection(key, value) {
    try {
      await patch("/api/content/home", { [key]: value });
      setContent((c) => ({ ...c, [key]: value }));
    } catch (err) {
      setError("Failed to save changes.");
    }
  }

  const sections = [
    {
      key: "about",
      title: "About Us",
      text: "Learn about our mission, history, values, and vision.",
      image: "/logo.png",
      childContainers: [
        {
          title: "Our History",
          text: "Our school has a rich history of academic excellence.",
          image: "/images/abouts/history.png",
        },
        {
          title: "Our Values",
          text: "Integrity, Respect, and Excellence are our core values.",
          image: "/images/abouts/values.png",
        },
        {
          title: "Our Vision",
          text: "To empower future leaders with knowledge and confidence.",
          image: "/images/abouts/vision.png",
        },
        {
          title: "Leadership",
          text: "We believe in strong leadership to guide our students.",
          image: "/images/abouts/leadership.png",
        },
        {
          title: "school Life",
          text: "Our vibrant campus is home to diverse activities.",
          image: "/images/abouts/school life.png",
        },
        {
          title: "Community Engagement",
          text: "We actively engage with the local community.",
          image: "/images/abouts/comunity.png",
        },
      ],
    },

    {
      key: "our-school",
      title: "About Our School",
      text: "Learn about our mission, history, values, and vision.",
      
      childContainers: [
        {
          title: "Our classes",
          text: "Get a chance to take your studies in our well condusive learning enviroments.",
          image: "/images/school/class 3.jpeg",
        },
        {
          
          image: "/images/school/dh 1.jpeg",
        },
        {
          
          image: "/images/school/face 2.jpeg",
        },
        {
          
          image: "/images/school/face 4.jpeg",
        },
        {
          
          image: "/images/school/06.jpeg",
        },
        {
          
          image: "/images/school/class 1.jpeg",
        },
      ],
    },

    {
      key: "student",
      title: "student life",
      text: "Learn about our mission, history, values, and vision.",
      image: "/images/gallery/school life/std 1.jpg",
      childContainers: [
        {
          title: "Students Engaged in Current Affairs Reading",
          text: "Students engaged in reading of newspapers during N.I.E launch.",
          image: "/images/gallery/school life/std 1.jpg",
        },
        {
          
          image: "/images/students/IMG_0778.JPG",
        },
        {
          image: "/images/students/IMG_1067.JPG",
        },
        {
          
          image: "/images/students/life.JPG",
        },
        {
          
          image: "/images/students/std 4.JPG",
        },
        {
         
          image: "/images/students/sc.JPG",
        },
        {
          
          image: "/images/students/std 2.JPG",
        },
      ],
    },

    {
      key: "admissions",
      title: "Admission Process",
      text: "See the full admission process and join our school.",
      image: "/images/admission/admission 1.jpeg",
      childContainers: [
        {
          title: "Admission Requirements",
          text: "Find out the requirements to apply to our school.",
          image: "/images/admission/require.png",
        },
        {
          title: "How to Apply",
          text: "A step-by-step guide to help you through the application process.",
          image: "/images/admission/apply.png",
        },
        {
          title: "Tuition Fees",
          text: "Learn about our competitive tuition fees and payment plans.",
          image: "/images/admission/fee.png",
        },
        {
          title: "Scholarships",
          text: "Explore the scholarship opportunities we offer.",
          image: "/images/admission/scholar.png",
        },
        {
          title: "Application Deadline",
          text: "Check the deadlines for applying for the upcoming academic year.",
          image: "/images/admission/deadline.png",
        },
        {
          title: "Admission Events",
          text: "Attend our open days and information sessions.",
          image: "/images/admission/events.png",
        },
        {
          title: "School Tours",
          text: "Take a virtual or in-person tour of our campus.",
          image: "/images/admission/campus-tours.png",
        },
      ],
    },
    {
      key: "curriculum",
      title: "Curriculum Overview",
      text: "Explore subjects, programs, and academic structure.",
      image: "/images/curriculum/curriculum 1.jpeg",
      childContainers: [
        {
          title: "Primary School Curriculum",
          text: "An introduction to our primary school curriculum.",
          image: "/images/curriculum/primary-curriculum-image.png",
        },
        {
          title: "Secondary School Curriculum",
          text: "A detailed overview of our secondary school offerings.",
          image: "/images/curriculum/secondary-curriculum-image.png",
        },
        {
          title: "Extracurricular Activities",
          text: "Sports, arts, and leadership programs beyond the classroom.",
          image: "/images/curriculum/extracurricular-image.png",
        },
        {
          title: "Assessments and Exams",
          text: "Information on how we assess our students' progress.",
          image: "/images/curriculum/assessment-image.png",
        },
        {
          title: "Curriculum Syllabus",
          text: "Detailed breakdown of each subject and course.",
          image: "/images/curriculum/syllabus-image.png",
        },
        {
          title: "Special Programs",
          text: "Our special programs for gifted students and more.",
          image: "/images/curriculum/special-programs-image.png",
        },
      ],
    },
    {
      key: "staff",
      title: "Our Staff",
      text: "Meet our teachers, leadership, and support staff.",
      image: "/images/staff/staff 1.jpeg",
      childContainers: [
        {
          title: "Leadership Team",
          text: "Meet the leaders guiding our institution.",
          image: "/images/staff/leadership-team-image.png",
        },
        {
          title: "Teaching Staff",
          text: "Our team of dedicated educators.",
          image: "/images/staff/teaching-staff-image.png",
        },
        {
          title: "Support Staff",
          text: "The support team that ensures the smooth running of our school.",
          image: "/images/staff/support-staff-image.png",
        },
        {
          title: "Staff Training",
          text: "Our continuous professional development programs.",
          image: "/images/staff/staff-training-image.png",
        },
        {
          title: "Staff Wellness",
          text: "We prioritize the well-being of our staff members.",
          image: "/images/staff/staff-wellness-image.png",
        },
        {
          title: "Faculty Achievements",
          text: "Recognizing the accomplishments of our academic staff.",
          image: "/images/staff/faculty-achievements-image.png",
        },
      ],
    },
    {
      key: "gallery",
      title: "school Gallery",
      text: "Browse photos of school events and student life.",
      image: "/images/gallery/gallery 1.jpeg",
      childContainers: [
        {
          title: "Sports Day",
          text: "Highlights from our annual sports events.",
          image: "/images/gallery/sports-day-image.png",
        },
        {
          title: "Cultural Celebrations",
          text: "A glimpse of our cultural festivals and events.",
          image: "/images/gallery/arts/19.JPG",
        },
        {
          title: "Graduation Ceremony",
          text: "Celebrate our students' achievements.",
          image: "/images/gallery/graduation-ceremony-image.png",
        },
        {
          title: "Field Trips",
          text: "Our students' educational field trips and excursions.",
          image: "/images/gallery/tours/IMG_0986.JPG",
        },
        {
          title: "Community Service",
          text: "The volunteer and service projects our students are involved in.",
          image: "/images/gallery/community-service-image.png",
        },
        {
          title: "Student Performances",
          text: "Talent shows, performances, and arts exhibitions.",
          image: "/images/gallery/arts/04.JPG",
        },
      ],
    },
    {
      key: "contact",
      title: "Get in Touch",
      text: "Reach out to us for inquiries and support.",
      
      childContainers: [
        {
          title: "Contact Information",
          text: "call us through the school official number on 0113688538.",
          image:"/images/contacts/phone-call.png"
          
        },
        {
          title: "  Whatsapp account details",
          text: "for any inquiry reach us through whatsapp account on +254 720 123456.",
          image:"/images/contacts/whatsapp.png"
        },
        {
          title: "Visit Us",
          text: "Plan  visit to our institution and experience our learning environment.",
          image:"/images/contacts/location.PNG"
      
          
        },
        {
          title: "Email Us",
          text: "Send us an email at info@nguvuigirls@yahoo.com for any questions or support.",
          image:"/images/contacts/gmail.png"
        },
        {
          title: "Support Services",
          text: "Get help with admissions, fees, and more.",
          
        },
        
      ],
    },
  ];

  const SectionGrid = ({ sections: gridSections }) => {
    return (
      <div style={{ marginTop: 20 }}>
        {gridSections.map((sec) => {
          const s = summaries[sec.key] || {};
          return (
            <div
              key={sec.key}
              style={{
                width: "100%",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                {sec.title || s.title}
              </h2>

              {/* Landscape Main Container */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: "0px",
                  childgap: "0px",
                  flexWrap: "wrap", // Ensures it’s responsive
                }}
              >
                {/* Loop through each child container for the section */}
                {sec.childContainers &&
                  sec.childContainers.map((child, index) => (
                    <div key={index} className="section-child">
                      {child.image && (
                        <div className="section-image">
                          <OptimizedImage
                            src={child.image || "/images/hike.jpeg"}
                            alt={child.title || ""}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center",
                            }}
                          />
                        </div>
                      )}
                      <h3 className="section-child-title">{child.title}</h3>
                      <p className="section-child-text">{child.text}</p>
                      <button
                        onClick={() => setRoute(sec.key)}
                        className="section-child-button"
                      >
                        Visit →
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section style={{ padding: 0, position: "relative", overflow: "hidden" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Video and Image Slider Section - Full Width */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          padding: 0,
        }}
      >
        <div
          className="video-section"
          style={{
            position: "relative",
            flex: 1,
            marginRight: 0,
            height: "400px",
          }}
        >
          {/* Lazy-loaded hero video */}
          <OptimizedVideo
            src="/images/videos/vid 1.mp4"
            autoPlay
            loop
            muted
            priority={true}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          <div className="welcome-text video-text">
            Welcome to NGUVIU GIRLS' SENIOR SCHOOL!
          </div>
        </div>

        <div
          className="image-slider"
          style={{
            position: "relative",
            flex: 1,
            height: "400px",
            backgroundImage: `url(${safePath("/header/hike.JPG")})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <ImageSlider />
          <div className="welcome-text image-text">Explore Our Gallery</div>
        </div>
      </div>

      <EditableHeading
        value={content.title || "Welcome to NGUVIU GIRLS' SCHOOL"}
        onSave={(val) => updateSection("title", val)}
        isAdmin={user?.role === "admin"}
        level={1}
      />

      <EditableText
        value={
          content.intro ||
          "At our institution, we believe education is a journey of creativity, growth, and excellence..."
        }
        onSave={(val) => updateSection("intro", val)}
        isAdmin={user?.role === "admin"}
      />

      {/* Main Sections */}
      <h2 style={{ marginTop: 30 }}>Quick Links</h2>
      <SectionGrid sections={sections} />
    </section>
  );
}

const ImageSlider = () => {
  const images = [
    "/images/background images/principle.jpeg",
    "/images/background images/deputy.jpeg",
    "/images/background images/img 1.jpeg",
    "/images/background images/lab 1.jpeg",
    "/images/background images/students 01.jpeg",

  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 800);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="slider-container" style={{ width: "100%", height: "100%" }}>
      <OptimizedImage
        src={images[currentIndex]}
        alt="School slideshow"
        className="slider-image"
        priority={currentIndex === 0}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.9s ease-in-out",
        }}
      />
    </div>
  );
};
