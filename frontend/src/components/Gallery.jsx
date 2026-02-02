import { useEffect, useState } from "react";
import { safePath } from "../utils/paths";
import { get } from "../utils/api";
import LazyImage from "./LazyImage";
import OptimizedImage, { OptimizedBackgroundImage } from "./OptimizedImage";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState(null); // Index for the full-screen view
  const [imageLoading, setImageLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState("all");
  const imagesPerPage = 4; // 2 rows x 2 columns

  const [categories, setCategories] = useState({
    all: [],
    main: [],
    arts: [],
    events: [],
    tours: []
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await get('/api/content/gallery');
        // backend returns array of gallery items; flatten attachments for simple gallery
        if (Array.isArray(data) && data.length > 0) {
          const flat = [];
          data.forEach((section) => {
            (section.attachments || []).forEach((att) => {
              flat.push({ url: att.url || att.downloadUrl, originalName: att.title || att.originalName || section.title, description: att.description || section.body });
            });
          });
          if (flat.length > 0) {
            setItems(flat);
            setLoading(false);
            return;
          }
        }

        // Fallback to static list if API empty
        const mainGallery = [
          { url: "/images/gallery/gallary.JPG", originalName: "School Gallery", description: "Main school gallery entrance" },
          { url: "/images/gallery/hike.jpeg", originalName: "Hiking Trip", description: "Students on a hiking adventure" },
          { url: "/images/gallery/IMG_0753.JPG", originalName: "School Activity", description: "Students engaged in school activities" },
          { url: "/images/gallery/IMG_0755.JPG", originalName: "School Event", description: "Memorable school event" },
          { url: "/images/gallery/IMG_0776.JPG", originalName: "School Life", description: "Daily life at KANGARU GIRLS" },
          { url: "/images/gallery/IMG_0778.JPG", originalName: "Student Activities", description: "Students participating in activities" },
          { url: "/images/gallery/IMG_0779.JPG", originalName: "Campus View", description: "Beautiful campus scenery" },
          { url: "/images/gallery/IMG_0791.JPG", originalName: "School Grounds", description: "Our well-maintained school grounds" },
          { url: "/images/gallery/IMG_0799.JPG", originalName: "School Day", description: "A typical school day" },
          { url: "/images/gallery/IMG_0800.JPG", originalName: "Learning Environment", description: "Our conducive learning environment" },
          { url: "/images/gallery/IMG_0801.JPG", originalName: "School Facilities", description: "Modern school facilities" },
          { url: "/images/gallery/IMG_0802.JPG", originalName: "Student Interaction", description: "Students working together" },
          { url: "/images/gallery/IMG_0803.JPG", originalName: "Campus Life", description: "Vibrant campus life" },
          { url: "/images/gallery/IMG_0937.JPG", originalName: "School Programs", description: "Engaging school programs" },
          { url: "/images/gallery/IMG_1006.JPG", originalName: "Academic Excellence", description: "Striving for academic excellence" },
          { url: "/images/replace/IMG_0969.JPG", originalName: "Student Achievement", description: "Celebrating student achievements" },
          { url: "/images/replace/IMG_0970.JPG", originalName: "School Community", description: "Our strong school community" },
          { url: "/images/replace/IMG_0971.JPG", originalName: "Student Life", description: "Enriching student life experiences" },
          { url: "/images/replace/IMG_0972.JPG", originalName: "School Activities", description: "Diverse school activities" },
          { url: "/images/replace/IMG_0973.JPG", originalName: "Campus Events", description: "Regular campus events" },
          { url: "/images/replace/IMG_0974.JPG", originalName: "School Spirit", description: "Showing our school spirit" },
          { url: "/images/replace/IMG_0981.JPG", originalName: "Student Engagement", description: "Active student engagement" },
          { url: "/images/replace/IMG_0982.JPG", originalName: "Learning Together", description: "Collaborative learning" },
          { url: "/images/replace/IMG_0983.JPG", originalName: "School Culture", description: "Our unique school culture" },
          { url: "/images/gallery/IMG_1853.JPG", originalName: "School Moments", description: "Capturing special moments" },
          { url: "/images/gallery/IMG_1869.JPG", originalName: "Student Success", description: "Celebrating student success" },
          { url: "/images/gallery/IMG_1875.JPG", originalName: "School Pride", description: "Taking pride in our school" },
          { url: "/images/gallery/IMG_1876.JPG", originalName: "Campus Beauty", description: "Beautiful campus views" },
          { url: "/images/gallery/IMG_1877.JPG", originalName: "School Unity", description: "Unity in our school family" },
          { url: "/images/gallery/IMG_1878.JPG", originalName: "Student Excellence", description: "Excellence in all we do" },
          { url: "/images/gallery/IMG_1879.JPG", originalName: "School Joy", description: "Joyful school environment" },
          { url: "/images/gallery/IMG_1883.JPG", originalName: "Learning Spaces", description: "Modern learning spaces" },
          { url: "/images/gallery/IMG_1886.JPG", originalName: "Student Growth", description: "Supporting student growth" },
          { url: "/images/gallery/IMG_1887.JPG", originalName: "School Excellence", description: "Pursuit of excellence" },
          { url: "/images/gallery/IMG_1906.JPG", originalName: "Campus Activities", description: "Varied campus activities" },
          { url: "/images/gallery/IMG_1907.JPG", originalName: "School Development", description: "Continuous development" },
          { url: "/images/gallery/IMG_1909.JPG", originalName: "Student Talent", description: "Nurturing student talents" },
          { url: "/images/gallery/IMG_1910.JPG", originalName: "School Leadership", description: "Developing future leaders" },
          { url: "/images/gallery/lab 2.jpeg", originalName: "Science Lab", description: "Our modern science laboratory" },
          { url: "/images/gallery/lab team 1.jpeg", originalName: "Lab Team", description: "Science lab team in action" },
          { url: "/images/gallery/std 2.jpg", originalName: "Student Group 2", description: "Students learning together" },
          { url: "/images/gallery/std 3.jpg", originalName: "Student Group 3", description: "Group study session" },
          { url: "/images/gallery/std 7.jpg", originalName: "Student Group 7", description: "Collaborative learning" },
          { url: "/images/gallery/students 01.jpeg", originalName: "Student Body", description: "Our wonderful student body" },
        ];
        
        const artsGallery = [
          { url: "/images/gallery/arts/01.JPG", originalName: "Arts Performance", description: "Students performing arts" },
          { url: "/images/gallery/arts/02.JPG", originalName: "Creative Arts", description: "Creative arts showcase" },
          { url: "/images/gallery/arts/03.JPG", originalName: "Music & Drama", description: "Music and drama performance" },
          { url: "/images/gallery/arts/04.JPG", originalName: "Artistic Expression", description: "Students expressing creativity" },
          { url: "/images/gallery/arts/05.JPG", originalName: "Arts Talent", description: "Showcasing artistic talent" },
          { url: "/images/gallery/arts/06.JPG", originalName: "Cultural Arts", description: "Cultural arts celebration" },
          { url: "/images/gallery/arts/07.JPG", originalName: "Performance Arts", description: "Performance arts event" },
          { url: "/images/gallery/arts/10.JPG", originalName: "Arts Festival", description: "Annual arts festival" },
          { url: "/images/gallery/arts/11.JPG", originalName: "Drama Club", description: "Drama club performance" },
          { url: "/images/gallery/arts/12.JPG", originalName: "Musical Show", description: "Musical performance" },
          { url: "/images/gallery/arts/13.JPG", originalName: "Dance Performance", description: "Dance team showcase" },
          { url: "/images/gallery/arts/14.JPG", originalName: "Arts Exhibition", description: "Arts exhibition display" },
          { url: "/images/gallery/arts/15.JPG", originalName: "Creative Show", description: "Creative arts show" },
          { url: "/images/gallery/arts/16.JPG", originalName: "Arts Gala", description: "Arts gala event" },
          { url: "/images/gallery/arts/17.JPG", originalName: "Talent Show", description: "Student talent showcase" },
          { url: "/images/gallery/arts/18.JPG", originalName: "Arts Program", description: "Arts program highlights" },
          { url: "/images/gallery/arts/19.JPG", originalName: "Performance Night", description: "Evening performance" },
          { url: "/images/gallery/arts/20.JPG", originalName: "Arts Award", description: "Arts awards ceremony" },
          { url: "/images/gallery/arts/21.JPG", originalName: "Cultural Dance", description: "Traditional dance performance" },
          { url: "/images/gallery/arts/22.JPG", originalName: "Arts Concert", description: "School arts concert" },
        ];
        
        const eventsGallery = [
          { url: "/images/gallery/events/IMG_1964.JPG", originalName: "School Event", description: "Major school event" },
          { url: "/images/gallery/events/IMG_1965.JPG", originalName: "Event Day", description: "Special event day" },
          { url: "/images/gallery/events/IMG_1966.JPG", originalName: "Celebration", description: "School celebration" },
          { url: "/images/gallery/events/IMG_1968.JPG", originalName: "Awards Ceremony", description: "Awards ceremony event" },
          { url: "/images/gallery/events/IMG_1969.JPG", originalName: "Sports Day", description: "Annual sports day" },
          { url: "/images/gallery/events/IMG_1970.JPG", originalName: "Special Occasion", description: "Special school occasion" },
          { url: "/images/gallery/events/IMG_1971.JPG", originalName: "School Festival", description: "School festival celebration" },
          { url: "/images/gallery/events/IMG_1972.JPG", originalName: "Event Gathering", description: "School gathering event" },
          { url: "/images/gallery/events/IMG_1973.JPG", originalName: "Annual Event", description: "Annual school event" },
          { url: "/images/gallery/events/IMG_1974.JPG", originalName: "Event Program", description: "Event program activities" },
          { url: "/images/gallery/events/IMG_1975.JPG", originalName: "Special Day", description: "Special day celebration" },
          { url: "/images/gallery/events/IMG_1976.JPG", originalName: "Event Activity", description: "Event activities" },
          { url: "/images/gallery/events/IMG_1977.JPG", originalName: "School Ceremony", description: "Official ceremony" },
          { url: "/images/gallery/events/IMG_1978.JPG", originalName: "Event Highlight", description: "Event highlights" },
          { url: "/images/gallery/events/IMG_1979.JPG", originalName: "Celebration Day", description: "Day of celebration" },
          { url: "/images/gallery/events/IMG_1980.JPG", originalName: "Event Success", description: "Successful event" },
          { url: "/images/gallery/events/IMG_1981.JPG", originalName: "School Function", description: "School function" },
          { url: "/images/gallery/events/IMG_1982.JPG", originalName: "Event Moments", description: "Memorable event moments" },
          { url: "/images/gallery/events/IMG_1983.JPG", originalName: "Grand Event", description: "Grand school event" },
          { url: "/images/gallery/events/IMG_1984.JPG", originalName: "Event Joy", description: "Joyful event" },
          { url: "/images/gallery/events/IMG_1985.JPG", originalName: "Event Pride", description: "Proud event moments" },
          { url: "/images/gallery/events/IMG_1986.JPG", originalName: "Event Unity", description: "Unity at events" },
          { url: "/images/gallery/events/IMG_1987.JPG", originalName: "Event Spirit", description: "School spirit event" },
          { url: "/images/gallery/events/IMG_1988.JPG", originalName: "Event Excellence", description: "Excellence in events" },
          { url: "/images/gallery/events/IMG_1989.JPG", originalName: "Event Achievement", description: "Event achievements" },
          { url: "/images/gallery/events/IMG_1990.JPG", originalName: "Event Participation", description: "Active participation" },
          { url: "/images/gallery/events/IMG_1991.JPG", originalName: "Event Community", description: "Community gathering" },
          { url: "/images/gallery/events/IMG_1992.JPG", originalName: "Event Together", description: "Coming together" },
          { url: "/images/gallery/events/IMG_1993.JPG", originalName: "Event Success Story", description: "Successful event" },
          { url: "/images/gallery/events/IMG_1994.JPG", originalName: "Event Memory", description: "Creating memories" },
          { url: "/images/gallery/events/IMG_1995.JPG", originalName: "Event Experience", description: "Great experiences" },
          { url: "/images/gallery/events/IMG_1996.JPG", originalName: "Event Milestone", description: "Milestone event" },
          { url: "/images/gallery/events/IMG_1997.JPG", originalName: "Event Celebration", description: "Celebration moments" },
          { url: "/images/gallery/events/IMG_1998.JPG", originalName: "Event Honor", description: "Honoring achievements" },
          { url: "/images/gallery/events/IMG_1999.JPG", originalName: "Event Recognition", description: "Recognition event" },
          { url: "/images/gallery/events/IMG_2001.JPG", originalName: "Event Gathering", description: "Community gathering" },
          { url: "/images/gallery/events/IMG_2002.JPG", originalName: "Event Fellowship", description: "Fellowship event" },
          { url: "/images/gallery/events/IMG_2003.JPG", originalName: "Event Teamwork", description: "Teamwork showcase" },
          { url: "/images/gallery/events/IMG_2004.JPG", originalName: "Event Bonding", description: "Bonding activities" },
          { url: "/images/gallery/events/IMG_2005.JPG", originalName: "Event Fun", description: "Fun-filled event" },
          { url: "/images/gallery/events/IMG_2006.JPG", originalName: "Event Energy", description: "Energetic event" },
          { url: "/images/gallery/events/IMG_2007.JPG", originalName: "Event Enthusiasm", description: "Enthusiastic participation" },
          { url: "/images/gallery/events/IMG_2008.JPG", originalName: "Event Passion", description: "Passionate performance" },
          { url: "/images/gallery/events/IMG_2009.JPG", originalName: "Event Dedication", description: "Dedicated effort" },
          { url: "/images/gallery/events/IMG_2010.JPG", originalName: "Event Commitment", description: "Commitment shown" },
          { url: "/images/gallery/events/IMG_2011.JPG", originalName: "Event Achievement", description: "Achievement celebrated" },
        ];
        
        const toursGallery = [
          { url: "/images/gallery/tours/IMG_0969.JPG", originalName: "Educational Tour", description: "Educational field trip" },
          { url: "/images/gallery/tours/IMG_0986.JPG", originalName: "Tour Experience", description: "Tour learning experience" },
          { url: "/images/gallery/tours/IMG_1332.JPG", originalName: "Tour Adventure", description: "Adventure tour" },
          { url: "/images/gallery/tours/std 6.jpg", originalName: "Tour Group", description: "Students on tour" },
        ];
        
        const allImages = [...mainGallery, ...artsGallery, ...eventsGallery, ...toursGallery];
        
        setCategories({
          all: allImages,
          main: mainGallery,
          arts: artsGallery,
          events: eventsGallery,
          tours: toursGallery
        });
        setItems(allImages);
        setLoading(false);
      } catch (err) {
        setItems([]);
        setError('Failed to load gallery');
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <section style={{ padding: 20 }}>
        <h2>Gallery</h2>
        <p>Loading gallery…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: 20 }}>
        <h2>Gallery</h2>
        <p style={{ color: "red" }}>{error}</p>
      </section>
    );
  }

  // Handle full-screen preview
  const handleImageClick = (index) => {
    setPreviewIndex(index); // Set index of the clicked image for preview
  };

  const handlePrev = () => {
    // Go to the previous image
    setPreviewIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    // Go to the next image
    setPreviewIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  };

  const nextPage = () => {
    setStartIndex((prev) => 
      Math.min(prev + imagesPerPage, items.length - imagesPerPage)
    );
  };

  const prevPage = () => {
    setStartIndex((prev) => Math.max(0, prev - imagesPerPage));
  };

  const switchCategory = (category) => {
    setCurrentCategory(category);
    setItems(categories[category]);
    setStartIndex(0);
  };

  const currentItems = items;

  return (
    <div className="gallery-page">
      <section style={{ padding: 20 }}>
      {/* ================= HERO BACKGROUND SECTION ================= */}
      <OptimizedBackgroundImage
        src="/images/gallery/gallary.JPG"
        className="gallery-hero"
        style={{
          position: "relative",
          width: "100vw",
          marginLeft: "50%",
          transform: "translateX(-50%)",
          minHeight: 420,
          overflow: "hidden",
          marginBottom: 30,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.65))",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              maxWidth: 720,
              width: "100%",
              padding: "16px 20px",
              borderRadius: 10,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "2rem" }}>Explore Our School Gallery</h2>
            <p style={{ fontSize: "1.1rem" }}>
              Discover amazing moments captured throughout our school's events, sports, and more.
            </p>
          </div>
        </div>
      </OptimizedBackgroundImage>

      <h2>Gallery</h2>
      <p style={{ maxWidth: 720, color: "#4b5563", fontSize: 14 }}>
        Explore highlights from school life, events, and activities. Click on images to view them in a larger preview.
      </p>

      {/* Category Filter Buttons */}
      <div className="gallery-tabs" style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", borderBottom: "2px solid #ccc", paddingBottom: "10px" }}>
        <button 
          onClick={() => switchCategory("all")}
          style={{ 
            padding: "8px 16px", 
            borderRadius: "6px", 
            border: currentCategory === "all" ? "2px solid #007bff" : "1px solid #ccc",
            background: currentCategory === "all" ? "#007bff" : "#fff",
            color: currentCategory === "all" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: currentCategory === "all" ? "bold" : "normal"
          }}
        >
          All Images ({categories.all.length})
        </button>
        <button 
          onClick={() => switchCategory("main")}
          style={{ 
            padding: "8px 16px", 
            borderRadius: "6px", 
            border: currentCategory === "main" ? "2px solid #007bff" : "1px solid #ccc",
            background: currentCategory === "main" ? "#007bff" : "#fff",
            color: currentCategory === "main" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: currentCategory === "main" ? "bold" : "normal"
          }}
        >
          School Life ({categories.main.length})
        </button>
        <button 
          onClick={() => switchCategory("arts")}
          style={{ 
            padding: "8px 16px", 
            borderRadius: "6px", 
            border: currentCategory === "arts" ? "2px solid #007bff" : "1px solid #ccc",
            background: currentCategory === "arts" ? "#007bff" : "#fff",
            color: currentCategory === "arts" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: currentCategory === "arts" ? "bold" : "normal"
          }}
        >
          Arts & Culture ({categories.arts.length})
        </button>
        <button 
          onClick={() => switchCategory("events")}
          style={{ 
            padding: "8px 16px", 
            borderRadius: "6px", 
            border: currentCategory === "events" ? "2px solid #007bff" : "1px solid #ccc",
            background: currentCategory === "events" ? "#007bff" : "#fff",
            color: currentCategory === "events" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: currentCategory === "events" ? "bold" : "normal"
          }}
        >
          Events & Celebrations ({categories.events.length})
        </button>
        <button 
          onClick={() => switchCategory("tours")}
          style={{ 
            padding: "8px 16px", 
            borderRadius: "6px", 
            border: currentCategory === "tours" ? "2px solid #007bff" : "1px solid #ccc",
            background: currentCategory === "tours" ? "#007bff" : "#fff",
            color: currentCategory === "tours" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: currentCategory === "tours" ? "bold" : "normal"
          }}
        >
          Educational Tours ({categories.tours.length})
        </button>
      </div>

      {/* ================= IMAGE CONTAINER ================= */}
      <div style={{ position: "relative", marginTop: 12 }}>
        {startIndex > 0 && (
          <button
            onClick={prevPage}
            className="gallery-nav gallery-nav-prev"
            aria-label="Previous images"
          >
            ‹
          </button>
        )}
        
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))",
          }}
          className="gallery-grid-optimized"
        >
          {currentItems.slice(startIndex, startIndex + imagesPerPage).map((item, idx) => {
            const actualIndex = startIndex + idx;
            return (
          <div
            key={actualIndex}
            style={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "0.75rem",
              background: "#ffffff",
              boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onClick={() => handleImageClick(actualIndex)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(15,23,42,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.06)";
            }}
          >
            <LazyImage
              src={safePath(item.url)}
              alt={item.originalName || `Gallery image ${actualIndex + 1}`}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <div style={{ marginTop: "10px" }}>
              <h4 style={{ fontSize: "0.95rem", marginBottom: "4px" }}>{item.originalName}</h4>
              <p style={{ fontSize: "0.8rem", color: "#6b7280", lineHeight: "1.4" }}>
                {item.description}
              </p>
            </div>
          </div>
            );
          })}
        </div>
        
        {startIndex + imagesPerPage < currentItems.length && (
          <button
            onClick={nextPage}
            className="gallery-nav gallery-nav-next"
            aria-label="Next images"
          >
            ›
          </button>
        )}
      </div>

      {/* Full-Screen Image Preview */}
      {previewIndex !== null && (
        <div
          onClick={() => setPreviewIndex(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "95%",
              maxHeight: "95%",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIndex(null);
              }}
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                background: "#fff",
                borderRadius: "999px",
                border: "none",
                padding: "8px 12px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "18px",
                zIndex: 10000,
              }}
              aria-label="Close preview"
            >
              ✕
            </button>
            
            {imageLoading && (
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#fff",
              }}>
                Loading...
              </div>
            )}
            
            <OptimizedImage
              src={items[previewIndex].url}
              alt="Preview"
              priority={true}
              onLoad={() => setImageLoading(false)}
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                display: "block",
                borderRadius: 8,
                objectFit: "contain",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                  setImageLoading(true);
                }}
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "none",
                  padding: "10px 16px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  fontWeight: 600,
                }}
                aria-label="Previous image"
              >
                ← Previous
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                  setImageLoading(true);
                }}
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "none",
                  padding: "10px 16px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  fontWeight: 600,
                }}
                aria-label="Next image"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
      </section>
    </div>
  );
}
