import React, { useState } from "react";
import { upload } from "../utils/api";

const downloadableFiles = [
  {
    name: "Admission Brochure 2025",
    url: "/downloads/admission-brochure.pdf",
  },
  {
    name: "Admission Guidelines",
    url: "/downloads/admission-guidelines.pdf",
  },
  {
    name: "Application Form (PDF)",
    url: "/down/Document 7.pdf",
  },
];

function AdmissionForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    assessmentNo: "",
    dateOfBirth: "",
    placeOfBirth: "",
    gender: "",
    nationality: "Kenyan",
    birthCertEntryNo: "",
    birthCertNo: "",
    
    // Location Details
    homeCounty: "",
    subCounty: "",
    constituency: "",
    location: "",
    subLocation: "",
    chiefName: "",
    chiefAddress: "",
    subChiefName: "",
    
    // Contact Information
    postalAddress: "",
    town: "",
    email: "",
    phone: "",
    mobileNo: "",
    
    // Academic Information
    juniorSchool: "",
    juniorSchoolAddress: "",
    applyingForGrade: "",
    pathway: "",
    subjectCombination: "",
    favouriteActivity: "",
    
    // Junior School Performance
    gradeKiswahili: "",
    gradeEnglish: "",
    gradeScience: "",
    gradeMaths: "",
    gradeCreativeArts: "",
    gradePreTechnical: "",
    gradeAgriculture: "",
    gradeSocialStudies: "",
    gradeCRE: "",
    
    // Religion
    religion: "",
    denomination: "",
    yearOfBaptism: "",
    
    // Father's Information
    fatherName: "",
    fatherOccupation: "",
    fatherIdNo: "",
    fatherAddress: "",
    fatherTelephone: "",
    
    // Mother's Information
    motherName: "",
    motherOccupation: "",
    motherIdNo: "",
    motherAddress: "",
    motherTelephone: "",
    
    // Guardian's Information
    guardianName: "",
    guardianOccupation: "",
    guardianIdNo: "",
    guardianAddress: "",
    guardianTelephone: "",
    guardianEmail: "",
    guardianPhone: "",
    
    // Medical & Special Needs
    specialMedicalCondition: "",
    specialNeeds: "",
    
    // Parent Comments
    parentComments: "",
    message: "",
    grade: "",
  });

  const [files, setFiles] = useState({
    birthCertificate: null,
    medicalCertificate: null,
    leavingCertificate: null,
    baptismCertificate: null,
    passportPhoto1: null,
    passportPhoto2: null,
    transferLetter: null,
    transcript: null,
    certificate: null,
  });

  const [declarations, setDeclarations] = useState({
    studentPromise: false,
    parentConfirmFit: false,
    parentUnderstandDiet: false,
  });

  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    const { name, files: selectedFiles } = e.target;
    setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
  }

  function handleCheckboxChange(e) {
    setDeclarations({ ...declarations, [e.target.name]: e.target.checked });
  }

  function nextStep() {
    setCurrentStep(prev => Math.min(6, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function prevStep() {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // If not on final step, just go to next step
    if (currentStep < 6) {
      nextStep();
      return;
    }

    // Final submission
    if (!declarations.studentPromise || !declarations.parentConfirmFit || !declarations.parentUnderstandDiet) {
      setStatus({ type: "error", message: "Please accept all declarations before submitting" });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      // Create form data for files and text
      const data = new FormData();
      
      // Add all form fields
      for (const key in formData) {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      }
      
      // Add declaration states
      for (const key in declarations) {
        data.append(key, declarations[key]);
      }
      
      // Add all files
      for (const key in files) {
        if (files[key]) {
          data.append(key, files[key]);
        }
      }

      const json = await upload("/api/admissions/apply", data);

      if (json && json.ok) {
        setStatus({ type: "success", message: "Application submitted successfully! You will receive a confirmation email shortly." });
        // Reset form
        setCurrentStep(1);
        setFormData({
          fullName: "", assessmentNo: "", dateOfBirth: "", placeOfBirth: "", gender: "", 
          nationality: "Kenyan", birthCertEntryNo: "", birthCertNo: "", homeCounty: "", 
          subCounty: "", constituency: "", location: "", subLocation: "", chiefName: "", 
          chiefAddress: "", subChiefName: "", postalAddress: "", town: "", email: "", 
          phone: "", mobileNo: "", juniorSchool: "", juniorSchoolAddress: "", applyingForGrade: "", 
          pathway: "", subjectCombination: "", favouriteActivity: "", gradeKiswahili: "", 
          gradeEnglish: "", gradeScience: "", gradeMaths: "", gradeCreativeArts: "", 
          gradePreTechnical: "", gradeAgriculture: "", gradeSocialStudies: "", gradeCRE: "", 
          religion: "", denomination: "", yearOfBaptism: "", fatherName: "", fatherOccupation: "", 
          fatherIdNo: "", fatherAddress: "", fatherTelephone: "", motherName: "", motherOccupation: "", 
          motherIdNo: "", motherAddress: "", motherTelephone: "", guardianName: "", guardianOccupation: "", 
          guardianIdNo: "", guardianAddress: "", guardianTelephone: "", guardianEmail: "", 
          specialMedicalCondition: "", specialNeeds: "", parentComments: "", message: "", 
          grade: "", guardianPhone: "",
        });
        setFiles({
          birthCertificate: null, medicalCertificate: null, leavingCertificate: null,
          baptismCertificate: null, passportPhoto1: null, passportPhoto2: null,
          transferLetter: null, transcript: null, certificate: null,
        });
        setDeclarations({
          studentPromise: false, parentConfirmFit: false, parentUnderstandDiet: false,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setStatus({ type: "error", message: "Failed to submit: " + (json && json.error) });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Network error: " + error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>ST. ANGELA KANGARU GIRLS' SENIOR SCHOOL</h1>
        <h2 style={styles.subtitle}>Admission Application Form 2025</h2>
      </div>

      {/* Download Section */}
      <section style={styles.downloadSection}>
        <h3 style={styles.sectionTitle}>📄 Download Admission Documents</h3>
        <div style={styles.downloadGrid}>
          {downloadableFiles.map((file) => (
            <a 
              key={file.name} 
              href={file.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              download
              style={styles.downloadLink}
            >
              📥 {file.name}
            </a>
          ))}
        </div>
      </section>

      {/* Progress Indicator */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(currentStep / 6) * 100}%` }} />
        </div>
        <div style={styles.progressText}>Step {currentStep} of 6</div>
      </div>

      {status && (
        <div style={{
          ...styles.statusMessage,
          backgroundColor: status.type === "success" ? "#d4edda" : "#f8d7da",
          color: status.type === "success" ? "#155724" : "#721c24",
        }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        
        {/* STEP 1: Personal Information */}
        {currentStep === 1 && (
          <div style={styles.step}>
            <h3 style={styles.stepTitle}>📝 Step 1: Personal Information</h3>
            <div style={styles.formGrid}>
              <label style={styles.label}>
                Full Name (As per Birth Certificate) <span style={styles.required}>*</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter full legal name"
                />
              </label>

              <label style={styles.label}>
                Assessment Number <span style={styles.required}>*</span>
                <input
                  type="text"
                  name="assessmentNo"
                  value={formData.assessmentNo}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter assessment number"
                />
              </label>

              <label style={styles.label}>
                Date of Birth <span style={styles.required}>*</span>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Place of Birth <span style={styles.required}>*</span>
                <input
                  type="text"
                  name="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter place of birth"
                />
              </label>

              <label style={styles.label}>
                Gender <span style={styles.required}>*</span>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  style={styles.input}
                >
                  <option value="">-- Select Gender --</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </label>

              <label style={styles.label}>
                Nationality <span style={styles.required}>*</span>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter nationality"
                />
              </label>

              <label style={styles.label}>
                Birth Certificate Entry Number <span style={styles.required}>*</span>
                <input
                  type="text"
                  name="birthCertEntryNo"
                  value={formData.birthCertEntryNo}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter entry number"
                />
              </label>

              <label style={styles.label}>
                Birth Certificate Number <span style={styles.required}>*</span>
                <input
                  type="text"
                  name="birthCertNo"
                  value={formData.birthCertNo}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter certificate number"
                />
              </label>
            </div>
          </div>
        )}

        {/* STEP 2: Location & Contact */}
        {currentStep === 2 && (
          <div style={styles.step}>
            <h3 style={styles.stepTitle}>📍 Step 2: Location & Contact Details</h3>
            <div style={styles.formGrid}>
              <label style={styles.label}>
                Home County <span style={styles.required}>*</span>
                <select
                  name="homeCounty"
                  value={formData.homeCounty}
                  onChange={handleChange}
                  required
                  style={styles.input}
                >
                  <option value="">-- Select County --</option>
                  <option value="Embu">Embu</option>
                  <option value="Nairobi">Nairobi</option>
                  <option value="Mombasa">Mombasa</option>
                  <option value="Kisumu">Kisumu</option>
                  <option value="Nakuru">Nakuru</option>
                  <option value="Kiambu">Kiambu</option>
                  <option value="Machakos">Machakos</option>
                  <option value="Meru">Meru</option>
                  <option value="Kirinyaga">Kirinyaga</option>
                  <option value="Tharaka Nithi">Tharaka Nithi</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label style={styles.label}>
                Sub-County <span style={styles.required}>*</span>
                <input
                  type="text"
                  name="subCounty"
                  value={formData.subCounty}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter sub-county"
                />
              </label>

              <label style={styles.label}>
                Constituency
                <input
                  type="text"
                  name="constituency"
                  value={formData.constituency}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter constituency"
                />
              </label>

              <label style={styles.label}>
                Location
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter location"
                />
              </label>

              <label style={styles.label}>
                Sub-location/Village
                <input
                  type="text"
                  name="subLocation"
                  value={formData.subLocation}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter village name"
                />
              </label>

              <label style={styles.label}>
                Chief's Name
                <input
                  type="text"
                  name="chiefName"
                  value={formData.chiefName}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter chief's name"
                />
              </label>

              <label style={styles.label}>
                Chief's Address
                <input
                  type="text"
                  name="chiefAddress"
                  value={formData.chiefAddress}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter chief's address"
                />
              </label>

              <label style={styles.label}>
                Sub-Chief's Name
                <input
                  type="text"
                  name="subChiefName"
                  value={formData.subChiefName}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter sub-chief's name"
                />
              </label>

              <label style={styles.label}>
                Postal Address <span style={styles.required}>*</span>
                <input
                  type="text"
                  name="postalAddress"
                  value={formData.postalAddress}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="P.O. Box XXXX-XXXXX"
                />
              </label>

              <label style={styles.label}>
                Town
                <input
                  type="text"
                  name="town"
                  value={formData.town}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter town"
                />
              </label>

              <label style={styles.label}>
                Email Address <span style={styles.required}>*</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="example@email.com"
                />
              </label>

              <label style={styles.label}>
                Mobile Number <span style={styles.required}>*</span>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="+254 7XX XXX XXX"
                />
              </label>
            </div>
          </div>
        )}

        {/* STEP 3: Academic Information */}
        {currentStep === 3 && (
          <div style={styles.step}>
            <h3 style={styles.stepTitle}>🎓 Step 3: Academic Information</h3>
            <div style={styles.formGrid}>
              <label style={styles.label}>
                Junior School Attended <span style={styles.required}>*</span>
                <input
                  type="text"
                  name="juniorSchool"
                  value={formData.juniorSchool}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter school name"
                />
              </label>

              <label style={styles.label}>
                Junior School Address
                <input
                  type="text"
                  name="juniorSchoolAddress"
                  value={formData.juniorSchoolAddress}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter school address"
                />
              </label>

              <label style={styles.label}>
                Applying For Grade <span style={styles.required}>*</span>
                <select
                  name="applyingForGrade"
                  value={formData.applyingForGrade}
                  onChange={handleChange}
                  required
                  style={styles.input}
                >
                  <option value="">-- Select Grade --</option>
                  <option value="Form 1">Form 1</option>
                  <option value="Form 2">Form 2</option>
                  <option value="Form 3">Form 3</option>
                  <option value="Form 4">Form 4</option>
                </select>
              </label>

              <label style={styles.label}>
                Pathway <span style={styles.required}>*</span>
                <select
                  name="pathway"
                  value={formData.pathway}
                  onChange={handleChange}
                  required
                  style={styles.input}
                >
                  <option value="">-- Select Pathway --</option>
                  <option value="STEM">STEM (Science, Technology, Engineering, Mathematics)</option>
                  <option value="Social Science">Social Science</option>
                  <option value="Arts & Sports">Arts & Sports</option>
                </select>
              </label>

              <label style={styles.labelFull}>
                Subject Combination
                <input
                  type="text"
                  name="subjectCombination"
                  value={formData.subjectCombination}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., Maths, Physics, Chemistry, Biology"
                />
              </label>

              <label style={styles.labelFull}>
                Favourite Activity
                <input
                  type="text"
                  name="favouriteActivity"
                  value={formData.favouriteActivity}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., Football, Debate, Music"
                />
              </label>
            </div>

            <h4 style={{ marginTop: 20, marginBottom: 15, color: '#667eea' }}>Junior School Performance (Rubrics)</h4>
            <div style={styles.formGrid}>
              <label style={styles.label}>
                Kiswahili Lugha
                <select name="gradeKiswahili" value={formData.gradeKiswahili} onChange={handleChange} style={styles.input}>
                  <option value="">-- Select Grade --</option>
                  <option value="Exceeds Expectations">Exceeds Expectations</option>
                  <option value="Meets Expectations">Meets Expectations</option>
                  <option value="Approaches Expectations">Approaches Expectations</option>
                  <option value="Below Expectations">Below Expectations</option>
                </select>
              </label>

              <label style={styles.label}>
                English Language
                <select name="gradeEnglish" value={formData.gradeEnglish} onChange={handleChange} style={styles.input}>
                  <option value="">-- Select Grade --</option>
                  <option value="Exceeds Expectations">Exceeds Expectations</option>
                  <option value="Meets Expectations">Meets Expectations</option>
                  <option value="Approaches Expectations">Approaches Expectations</option>
                  <option value="Below Expectations">Below Expectations</option>
                </select>
              </label>

              <label style={styles.label}>
                Integrated Science
                <select name="gradeScience" value={formData.gradeScience} onChange={handleChange} style={styles.input}>
                  <option value="">-- Select Grade --</option>
                  <option value="Exceeds Expectations">Exceeds Expectations</option>
                  <option value="Meets Expectations">Meets Expectations</option>
                  <option value="Approaches Expectations">Approaches Expectations</option>
                  <option value="Below Expectations">Below Expectations</option>
                </select>
              </label>

              <label style={styles.label}>
                Mathematics
                <select name="gradeMaths" value={formData.gradeMaths} onChange={handleChange} style={styles.input}>
                  <option value="">-- Select Grade --</option>
                  <option value="Exceeds Expectations">Exceeds Expectations</option>
                  <option value="Meets Expectations">Meets Expectations</option>
                  <option value="Approaches Expectations">Approaches Expectations</option>
                  <option value="Below Expectations">Below Expectations</option>
                </select>
              </label>

              <label style={styles.label}>
                Creative Arts & Sports
                <select name="gradeCreativeArts" value={formData.gradeCreativeArts} onChange={handleChange} style={styles.input}>
                  <option value="">-- Select Grade --</option>
                  <option value="Exceeds Expectations">Exceeds Expectations</option>
                  <option value="Meets Expectations">Meets Expectations</option>
                  <option value="Approaches Expectations">Approaches Expectations</option>
                  <option value="Below Expectations">Below Expectations</option>
                </select>
              </label>

              <label style={styles.label}>
                Pre-Technical Studies
                <select name="gradePreTechnical" value={formData.gradePreTechnical} onChange={handleChange} style={styles.input}>
                  <option value="">-- Select Grade --</option>
                  <option value="Exceeds Expectations">Exceeds Expectations</option>
                  <option value="Meets Expectations">Meets Expectations</option>
                  <option value="Approaches Expectations">Approaches Expectations</option>
                  <option value="Below Expectations">Below Expectations</option>
                </select>
              </label>

              <label style={styles.label}>
                Agriculture
                <select name="gradeAgriculture" value={formData.gradeAgriculture} onChange={handleChange} style={styles.input}>
                  <option value="">-- Select Grade --</option>
                  <option value="Exceeds Expectations">Exceeds Expectations</option>
                  <option value="Meets Expectations">Meets Expectations</option>
                  <option value="Approaches Expectations">Approaches Expectations</option>
                  <option value="Below Expectations">Below Expectations</option>
                </select>
              </label>

              <label style={styles.label}>
                Social Studies
                <select name="gradeSocialStudies" value={formData.gradeSocialStudies} onChange={handleChange} style={styles.input}>
                  <option value="">-- Select Grade --</option>
                  <option value="Exceeds Expectations">Exceeds Expectations</option>
                  <option value="Meets Expectations">Meets Expectations</option>
                  <option value="Approaches Expectations">Approaches Expectations</option>
                  <option value="Below Expectations">Below Expectations</option>
                </select>
              </label>

              <label style={styles.label}>
                CRE
                <select name="gradeCRE" value={formData.gradeCRE} onChange={handleChange} style={styles.input}>
                  <option value="">-- Select Grade --</option>
                  <option value="Exceeds Expectations">Exceeds Expectations</option>
                  <option value="Meets Expectations">Meets Expectations</option>
                  <option value="Approaches Expectations">Approaches Expectations</option>
                  <option value="Below Expectations">Below Expectations</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: Religion & Parents */}
        {currentStep === 4 && (
          <div style={styles.step}>
            <h3 style={styles.stepTitle}>👨‍👩‍👧 Step 4: Religion & Parent/Guardian Information</h3>
            
            <h4 style={{ marginBottom: 15, color: '#667eea' }}>Religion</h4>
            <div style={styles.formGrid}>
              <label style={styles.label}>
                Religion
                <select name="religion" value={formData.religion} onChange={handleChange} style={styles.input}>
                  <option value="">-- Select Religion --</option>
                  <option value="Christian">Christian</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label style={styles.label}>
                Denomination
                <input
                  type="text"
                  name="denomination"
                  value={formData.denomination}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., Catholic, Protestant"
                />
              </label>

              <label style={styles.label}>
                Year of Baptism/Confirmation
                <input
                  type="number"
                  name="yearOfBaptism"
                  value={formData.yearOfBaptism}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="YYYY"
                />
              </label>
            </div>

            <h4 style={{ marginTop: 25, marginBottom: 15, color: '#667eea' }}>Father's Information</h4>
            <div style={styles.formGrid}>
              <label style={styles.label}>
                Father's Full Name
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter father's name"
                />
              </label>

              <label style={styles.label}>
                Occupation
                <input
                  type="text"
                  name="fatherOccupation"
                  value={formData.fatherOccupation}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter occupation"
                />
              </label>

              <label style={styles.label}>
                ID/Passport Number
                <input
                  type="text"
                  name="fatherIdNo"
                  value={formData.fatherIdNo}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter ID number"
                />
              </label>

              <label style={styles.label}>
                Address
                <input
                  type="text"
                  name="fatherAddress"
                  value={formData.fatherAddress}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter address"
                />
              </label>

              <label style={styles.label}>
                Telephone
                <input
                  type="tel"
                  name="fatherTelephone"
                  value={formData.fatherTelephone}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="+254 7XX XXX XXX"
                />
              </label>
            </div>

            <h4 style={{ marginTop: 25, marginBottom: 15, color: '#667eea' }}>Mother's Information</h4>
            <div style={styles.formGrid}>
              <label style={styles.label}>
                Mother's Full Name
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter mother's name"
                />
              </label>

              <label style={styles.label}>
                Occupation
                <input
                  type="text"
                  name="motherOccupation"
                  value={formData.motherOccupation}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter occupation"
                />
              </label>

              <label style={styles.label}>
                ID/Passport Number
                <input
                  type="text"
                  name="motherIdNo"
                  value={formData.motherIdNo}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter ID number"
                />
              </label>

              <label style={styles.label}>
                Address
                <input
                  type="text"
                  name="motherAddress"
                  value={formData.motherAddress}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter address"
                />
              </label>

              <label style={styles.label}>
                Telephone
                <input
                  type="tel"
                  name="motherTelephone"
                  value={formData.motherTelephone}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="+254 7XX XXX XXX"
                />
              </label>
            </div>

            <h4 style={{ marginTop: 25, marginBottom: 15, color: '#667eea' }}>Guardian's Information (if applicable)</h4>
            <div style={styles.formGrid}>
              <label style={styles.label}>
                Guardian's Full Name
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter guardian's name"
                />
              </label>

              <label style={styles.label}>
                Occupation
                <input
                  type="text"
                  name="guardianOccupation"
                  value={formData.guardianOccupation}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter occupation"
                />
              </label>

              <label style={styles.label}>
                ID/Passport Number
                <input
                  type="text"
                  name="guardianIdNo"
                  value={formData.guardianIdNo}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter ID number"
                />
              </label>

              <label style={styles.label}>
                Address
                <input
                  type="text"
                  name="guardianAddress"
                  value={formData.guardianAddress}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter address"
                />
              </label>

              <label style={styles.label}>
                Telephone
                <input
                  type="tel"
                  name="guardianTelephone"
                  value={formData.guardianTelephone}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="+254 7XX XXX XXX"
                />
              </label>

              <label style={styles.label}>
                Email
                <input
                  type="email"
                  name="guardianEmail"
                  value={formData.guardianEmail}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="guardian@email.com"
                />
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: Documents Upload */}
        {currentStep === 5 && (
          <div style={styles.step}>
            <h3 style={styles.stepTitle}>📎 Step 5: Upload Required Documents</h3>
            <p style={{ marginBottom: 20, color: '#666' }}>
              Please upload all required documents. Accepted formats: PDF, JPG, JPEG, PNG (Max 5MB each)
            </p>

            <div style={styles.uploadGrid}>
              <FileUploadField 
                label="Birth Certificate"
                name="birthCertificate"
                required
                file={files.birthCertificate}
                onChange={handleFileChange}
              />

              <FileUploadField 
                label="Medical Certificate"
                name="medicalCertificate"
                file={files.medicalCertificate}
                onChange={handleFileChange}
              />

              <FileUploadField 
                label="Leaving Certificate"
                name="leavingCertificate"
                required
                file={files.leavingCertificate}
                onChange={handleFileChange}
              />

              <FileUploadField 
                label="Baptism Certificate"
                name="baptismCertificate"
                file={files.baptismCertificate}
                onChange={handleFileChange}
              />

              <FileUploadField 
                label="Passport Photo 1"
                name="passportPhoto1"
                required
                file={files.passportPhoto1}
                onChange={handleFileChange}
              />

              <FileUploadField 
                label="Passport Photo 2"
                name="passportPhoto2"
                file={files.passportPhoto2}
                onChange={handleFileChange}
              />

              <FileUploadField 
                label="Transfer Letter"
                name="transferLetter"
                file={files.transferLetter}
                onChange={handleFileChange}
              />
            </div>

            <h4 style={{ marginTop: 25, marginBottom: 15, color: '#667eea' }}>Medical & Special Needs</h4>
            <div style={styles.formGrid}>
              <label style={styles.labelFull}>
                Special Medical Condition (if any)
                <textarea
                  name="specialMedicalCondition"
                  value={formData.specialMedicalCondition}
                  onChange={handleChange}
                  style={{ ...styles.input, height: 80, resize: 'vertical' }}
                  placeholder="Please describe any medical conditions we should be aware of"
                />
              </label>

              <label style={styles.labelFull}>
                Special Needs (if any)
                <textarea
                  name="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={handleChange}
                  style={{ ...styles.input, height: 80, resize: 'vertical' }}
                  placeholder="Please describe any special needs or accommodations required"
                />
              </label>
            </div>
          </div>
        )}

        {/* STEP 6: Declarations */}
        {currentStep === 6 && (
          <div style={styles.step}>
            <h3 style={styles.stepTitle}>✅ Step 6: Declarations & Submission</h3>
            
            <div style={styles.declarationBox}>
              <h4 style={{ color: '#667eea', marginBottom: 15 }}>Student Promise</h4>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="studentPromise"
                  checked={declarations.studentPromise}
                  onChange={handleCheckboxChange}
                  required
                  style={styles.checkbox}
                />
                <span>
                  I promise to abide by the school rules and regulations, respect teachers and fellow students, 
                  and work hard to achieve academic excellence.
                </span>
              </label>
            </div>

            <div style={styles.declarationBox}>
              <h4 style={{ color: '#667eea', marginBottom: 15 }}>Parent/Guardian Declarations</h4>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="parentConfirmFit"
                  checked={declarations.parentConfirmFit}
                  onChange={handleCheckboxChange}
                  required
                  style={styles.checkbox}
                />
                <span>
                  I confirm that the student is medically and mentally fit to attend school and participate in all school activities.
                </span>
              </label>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="parentUnderstandDiet"
                  checked={declarations.parentUnderstandDiet}
                  onChange={handleCheckboxChange}
                  required
                  style={styles.checkbox}
                />
                <span>
                  I understand and accept the school's dietary provisions and agree to pay all fees as per the school's fee structure.
                </span>
              </label>
            </div>

            <div style={styles.formGrid}>
              <label style={styles.labelFull}>
                Parent/Guardian Comments (Optional)
                <textarea
                  name="parentComments"
                  value={formData.parentComments}
                  onChange={handleChange}
                  style={{ ...styles.input, height: 100, resize: 'vertical' }}
                  placeholder="Any additional information you would like to share with the school..."
                />
              </label>
            </div>

            <div style={styles.finalNote}>
              <p><strong>⚠️ Important:</strong> Please ensure all information provided is accurate and truthful. 
              False information may lead to disqualification of the application.</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={styles.navigation}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              style={styles.btnSecondary}
            >
              ← Previous
            </button>
          )}
          
          {currentStep < 6 ? (
            <button
              type="submit"
              style={styles.btnPrimary}
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.btnPrimary,
                backgroundColor: submitting ? "#aaa" : "#28a745",
              }}
            >
              {submitting ? "⏳ Submitting..." : "✅ Submit Application"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// File Upload Component
function FileUploadField({ label, name, required, file, onChange }) {
  return (
    <div style={styles.uploadField}>
      <label style={styles.uploadLabel}>
        {label} {required && <span style={styles.required}>*</span>}
      </label>
      <div style={styles.uploadBox}>
        <input
          type="file"
          name={name}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onChange}
          required={required}
          style={styles.fileInput}
          id={`file-${name}`}
        />
        <label htmlFor={`file-${name}`} style={styles.uploadButton}>
          {file ? "✅ " + file.name : "📎 Choose File"}
        </label>
        {file && (
          <div style={styles.filePreview}>
            📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: 900,
    margin: "auto",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: 30,
    borderRadius: 10,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
  },
  subtitle: {
    margin: "10px 0 0 0",
    fontSize: 18,
    fontWeight: 400,
  },
  downloadSection: {
    marginBottom: 30,
    padding: 20,
    background: "#f8f9fa",
    borderRadius: 8,
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: 15,
    color: "#333",
  },
  downloadGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 10,
  },
  downloadLink: {
    display: "block",
    padding: 12,
    background: "#007bff",
    color: "#fff",
    textDecoration: "none",
    borderRadius: 6,
    textAlign: "center",
    transition: "background 0.2s",
  },
  progressContainer: {
    marginBottom: 25,
  },
  progressBar: {
    height: 8,
    background: "#e9ecef",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    transition: "width 0.3s ease",
  },
  progressText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: 600,
  },
  statusMessage: {
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
    fontWeight: 500,
  },
  step: {
    background: "#fff",
    border: "1px solid #dee2e6",
    borderRadius: 10,
    padding: 25,
    marginBottom: 20,
  },
  stepTitle: {
    marginTop: 0,
    marginBottom: 20,
    fontSize: 20,
    color: "#667eea",
    borderBottom: "2px solid #e9ecef",
    paddingBottom: 10,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 15,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: 14,
    fontWeight: 500,
    color: "#495057",
  },
  labelFull: {
    display: "flex",
    flexDirection: "column",
    fontSize: 14,
    fontWeight: 500,
    color: "#495057",
    gridColumn: "1 / -1",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    marginTop: 5,
    borderRadius: 6,
    border: "1px solid #ced4da",
    fontSize: 14,
    boxSizing: "border-box",
  },
  required: {
    color: "#dc3545",
    fontWeight: 700,
  },
  uploadGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 20,
  },
  uploadField: {
    display: "flex",
    flexDirection: "column",
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "#495057",
    marginBottom: 8,
  },
  uploadBox: {
    position: "relative",
  },
  fileInput: {
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
  },
  uploadButton: {
    display: "block",
    padding: 12,
    background: "#e7f5ff",
    border: "2px dashed #339af0",
    borderRadius: 6,
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    color: "#1971c2",
    fontWeight: 500,
  },
  filePreview: {
    marginTop: 8,
    fontSize: 12,
    color: "#28a745",
    padding: 8,
    background: "#d4edda",
    borderRadius: 4,
  },
  declarationBox: {
    padding: 20,
    background: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 20,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: 15,
    fontSize: 14,
    cursor: "pointer",
  },
  checkbox: {
    marginRight: 10,
    marginTop: 3,
    width: 18,
    height: 18,
    cursor: "pointer",
  },
  finalNote: {
    padding: 15,
    background: "#fff3cd",
    borderLeft: "4px solid #ffc107",
    borderRadius: 6,
    marginTop: 20,
    fontSize: 14,
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    gap: 15,
    marginTop: 25,
  },
  btnPrimary: {
    flex: 1,
    padding: "12px 24px",
    background: "#667eea",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  btnSecondary: {
    flex: 1,
    padding: "12px 24px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
};

// Responsive Styles
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  if (mediaQuery.matches) {
    styles.formGrid.gridTemplateColumns = '1fr';
    styles.uploadGrid.gridTemplateColumns = '1fr';
  }
}

export default AdmissionForm;
