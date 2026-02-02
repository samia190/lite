import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import notify from "../utils/notify";
import AdminButton from "./AdminButton";

function formatDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

function Spinner() {
  return <div style={{ padding: 12, textAlign: 'center' }}>⏳ Loading submissions...</div>;
}

export default function AdminSubmissions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [isNarrow, setIsNarrow] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 900);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  async function load(p = page) {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      if (query) qs.set("search", query);
      if (statusFilter) qs.set("status", statusFilter);
      qs.set("page", p);
      qs.set("limit", limit);
      const data = await apiFetch(`/api/submissions?${qs.toString()}`);
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || p);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, [limit]);

  async function refreshAndClose() {
    await load();
    setSelected(null);
  }

  async function doAction(id, action) {
    try {
      setLoading(true);
      if (action === "delete") {
        if (!confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
          setLoading(false);
          return;
        }
        await apiFetch(`/api/submissions/${id}`, { method: "DELETE" });
        notify("Submission deleted successfully", "success");
      } else {
        const status = action === "approve" ? "approved" : "rejected";
        await apiFetch(`/api/submissions/${id}`, { method: "PUT", body: { status } });
        notify(`Submission ${status} successfully`, "success");
      }
      await load();
    } catch (err) {
      notify(err?.body?.error || err?.message || "Action failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function downloadAsZip(submission) {
    setDownloading(true);
    try {
      const response = await fetch(`/api/submissions/${submission._id}/download-zip`);
      if (!response.ok) throw new Error("Failed to download ZIP");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admission-${submission.fullName || submission._id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      notify("Download started", "success");
    } catch (err) {
      notify("Download failed. Feature may not be implemented yet on backend.", "error");
      console.error(err);
    } finally {
      setDownloading(false);
    }
  }

  async function downloadAsPDF(submission) {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        notify("Please allow pop-ups to print", "error");
        return;
      }
      
      printWindow.document.write(generatePrintableHTML(submission));
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } catch (err) {
      notify("Print failed: " + err.message, "error");
    }
  }

  function generatePrintableHTML(sub) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admission Application - ${sub.fullName || 'Unknown'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
          h2 { color: #667eea; margin-top: 30px; border-bottom: 2px solid #eee; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f8f9fa; font-weight: bold; width: 30%; }
          .header { text-align: center; margin-bottom: 30px; }
          .status { padding: 5px 10px; border-radius: 5px; display: inline-block; }
          .status.pending { background: #fff3cd; color: #856404; }
          .status.approved { background: #d4edda; color: #155724; }
          .status.rejected { background: #f8d7da; color: #721c24; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            body { margin: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ST. ANGELA KANGARU GIRLS' SENIOR SCHOOL</h1>
          <h3>Admission Application Form</h3>
          <p>Application ID: ${sub._id}</p>
          <p>Submitted: ${formatDate(sub.submittedAt || sub.uploadedAt)}</p>
          <p>Status: <span class="status ${sub.status}">${(sub.status || 'pending').toUpperCase()}</span></p>
        </div>

        <h2>Personal Information</h2>
        <table>
          <tr><th>Full Name</th><td>${sub.fullName || '-'}</td></tr>
          <tr><th>Assessment No</th><td>${sub.assessmentNo || '-'}</td></tr>
          <tr><th>Date of Birth</th><td>${sub.dateOfBirth || '-'}</td></tr>
          <tr><th>Place of Birth</th><td>${sub.placeOfBirth || '-'}</td></tr>
          <tr><th>Gender</th><td>${sub.gender || '-'}</td></tr>
          <tr><th>Nationality</th><td>${sub.nationality || '-'}</td></tr>
          <tr><th>Birth Cert Entry No</th><td>${sub.birthCertEntryNo || '-'}</td></tr>
          <tr><th>Birth Cert No</th><td>${sub.birthCertNo || '-'}</td></tr>
        </table>

        <h2>Location Details</h2>
        <table>
          <tr><th>Home County</th><td>${sub.homeCounty || '-'}</td></tr>
          <tr><th>Sub-County</th><td>${sub.subCounty || '-'}</td></tr>
          <tr><th>Constituency</th><td>${sub.constituency || '-'}</td></tr>
          <tr><th>Location</th><td>${sub.location || '-'}</td></tr>
          <tr><th>Sub-location/Village</th><td>${sub.subLocation || '-'}</td></tr>
          <tr><th>Chief's Name</th><td>${sub.chiefName || '-'}</td></tr>
          <tr><th>Sub-Chief's Name</th><td>${sub.subChiefName || '-'}</td></tr>
        </table>

        <h2>Contact Information</h2>
        <table>
          <tr><th>Postal Address</th><td>${sub.postalAddress || '-'}</td></tr>
          <tr><th>Town</th><td>${sub.town || '-'}</td></tr>
          <tr><th>Email</th><td>${sub.email || '-'}</td></tr>
          <tr><th>Mobile No</th><td>${sub.mobileNo || '-'}</td></tr>
        </table>

        <h2>Academic Information</h2>
        <table>
          <tr><th>Junior School</th><td>${sub.juniorSchool || '-'}</td></tr>
          <tr><th>Junior School Address</th><td>${sub.juniorSchoolAddress || '-'}</td></tr>
          <tr><th>Applying For Grade</th><td>${sub.applyingForGrade || '-'}</td></tr>
          <tr><th>Pathway</th><td>${sub.pathway || '-'}</td></tr>
          <tr><th>Subject Combination</th><td>${sub.subjectCombination || '-'}</td></tr>
          <tr><th>Favourite Activity</th><td>${sub.favouriteActivity || '-'}</td></tr>
        </table>

        <h2>Junior School Performance (Rubrics)</h2>
        <table>
          <tr><th>Kiswahili Lugha</th><td>${sub.gradeKiswahili || '-'}</td></tr>
          <tr><th>English Language</th><td>${sub.gradeEnglish || '-'}</td></tr>
          <tr><th>Integrated Science</th><td>${sub.gradeScience || '-'}</td></tr>
          <tr><th>Mathematics</th><td>${sub.gradeMaths || '-'}</td></tr>
          <tr><th>Creative Arts & Sports</th><td>${sub.gradeCreativeArts || '-'}</td></tr>
          <tr><th>Pre-Technical Studies</th><td>${sub.gradePreTechnical || '-'}</td></tr>
          <tr><th>Agriculture</th><td>${sub.gradeAgriculture || '-'}</td></tr>
          <tr><th>Social Studies</th><td>${sub.gradeSocialStudies || '-'}</td></tr>
          <tr><th>CRE</th><td>${sub.gradeCRE || '-'}</td></tr>
        </table>

        <h2>Religion</h2>
        <table>
          <tr><th>Religion</th><td>${sub.religion || '-'}</td></tr>
          <tr><th>Denomination</th><td>${sub.denomination || '-'}</td></tr>
          <tr><th>Year of Baptism</th><td>${sub.yearOfBaptism || '-'}</td></tr>
        </table>

        <h2>Father's Information</h2>
        <table>
          <tr><th>Name</th><td>${sub.fatherName || '-'}</td></tr>
          <tr><th>Occupation</th><td>${sub.fatherOccupation || '-'}</td></tr>
          <tr><th>ID/Passport No</th><td>${sub.fatherIdNo || '-'}</td></tr>
          <tr><th>Address</th><td>${sub.fatherAddress || '-'}</td></tr>
          <tr><th>Telephone</th><td>${sub.fatherTelephone || '-'}</td></tr>
        </table>

        <h2>Mother's Information</h2>
        <table>
          <tr><th>Name</th><td>${sub.motherName || '-'}</td></tr>
          <tr><th>Occupation</th><td>${sub.motherOccupation || '-'}</td></tr>
          <tr><th>ID/Passport No</th><td>${sub.motherIdNo || '-'}</td></tr>
          <tr><th>Address</th><td>${sub.motherAddress || '-'}</td></tr>
          <tr><th>Telephone</th><td>${sub.motherTelephone || '-'}</td></tr>
        </table>

        ${sub.guardianName ? `
        <h2>Guardian's Information</h2>
        <table>
          <tr><th>Name</th><td>${sub.guardianName || '-'}</td></tr>
          <tr><th>Occupation</th><td>${sub.guardianOccupation || '-'}</td></tr>
          <tr><th>ID/Passport No</th><td>${sub.guardianIdNo || '-'}</td></tr>
          <tr><th>Address</th><td>${sub.guardianAddress || '-'}</td></tr>
          <tr><th>Telephone</th><td>${sub.guardianTelephone || '-'}</td></tr>
          <tr><th>Email</th><td>${sub.guardianEmail || '-'}</td></tr>
        </table>
        ` : ''}

        <h2>Medical & Special Needs</h2>
        <table>
          <tr><th>Special Medical Condition</th><td>${sub.specialMedicalCondition || 'None'}</td></tr>
          <tr><th>Special Needs</th><td>${sub.specialNeeds || 'None'}</td></tr>
        </table>

        <h2>Parent Comments</h2>
        <p>${sub.parentComments || 'No comments'}</p>

        <div class="footer">
          <p>This is a computer-generated document from St. Angela KANGARU GIRLS' Senior School Admission System</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section style={{ padding: 20 }}>
      <div style={{ marginBottom: 25 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#212529' }}>📋 Admission Submissions Management</h2>
        <p style={{ margin: '8px 0 0 0', fontSize: 14, color: '#6c757d' }}>View, approve, and manage student admission applications</p>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input 
          placeholder="🔍 Search by name, email, assessment no..." 
          value={query} 
          onChange={(e)=>setQuery(e.target.value)} 
          style={{ flex: '1 1 300px', padding: 10, border: '1px solid #ced4da', borderRadius: 6, fontSize: 14 }}
        />
        <select 
          value={statusFilter} 
          onChange={(e)=>setStatusFilter(e.target.value)}
          style={{ padding: 10, border: '1px solid #ced4da', borderRadius: 6, fontSize: 14 }}
        >
          <option value="">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="approved">✅ Approved</option>
          <option value="rejected">❌ Rejected</option>
        </select>
        <select 
          value={limit} 
          onChange={(e)=>setLimit(Number(e.target.value))}
          style={{ padding: 10, border: '1px solid #ced4da', borderRadius: 6, fontSize: 14 }}
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
        <AdminButton onClick={()=>load(1)} variant="primary">Search</AdminButton>
      </div>

      {/* Stats Dashboard */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: 15, 
        marginBottom: 25 
      }}>
        <div style={{ 
          padding: 20, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: 10, 
          color: '#fff', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{total}</div>
          <div style={{ fontSize: 13, marginTop: 5, opacity: 0.9 }}>Total Submissions</div>
        </div>
        <div style={{ 
          padding: 20, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: 10, 
          color: '#fff', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{items.filter(i => i.status === 'pending').length}</div>
          <div style={{ fontSize: 13, marginTop: 5, opacity: 0.9 }}>Pending Review</div>
        </div>
        <div style={{ 
          padding: 20, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: 10, 
          color: '#fff', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{items.filter(i => i.status === 'approved').length}</div>
          <div style={{ fontSize: 13, marginTop: 5, opacity: 0.9 }}>Approved</div>
        </div>
        <div style={{ 
          padding: 20, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: 10, 
          color: '#fff', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{items.filter(i => i.status === 'rejected').length}</div>
          <div style={{ fontSize: 13, marginTop: 5, opacity: 0.9 }}>Rejected</div>
        </div>
      </div>

      {loading && <Spinner />}
      {error && <div style={{ padding: 15, background: '#f8d7da', color: '#721c24', borderRadius: 6, marginBottom: 20 }}>{error}</div>}

      {/* Submissions List */}
      {!loading && (
        <div style={{ display: 'grid', gap: 15 }}>
          {items.map(item => (
            <div key={item._id} style={{ 
              background: '#fff', 
              border: '1px solid #dee2e6', 
              borderRadius: 10, 
              padding: 20, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#212529' }}>
                    {item.fullName || item.originalName || 'Unnamed Applicant'}
                  </h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: 13, color: '#6c757d' }}>
                    Assessment No: {item.assessmentNo || 'N/A'} • 
                    Grade: {item.applyingForGrade || item.grade || 'N/A'} • 
                    Submitted: {formatDate(item.submittedAt || item.uploadedAt)}
                  </p>
                </div>
                <span style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  ...(item.status === 'approved' ? { background: '#d4edda', color: '#155724' } : 
                      item.status === 'rejected' ? { background: '#f8d7da', color: '#721c24' } : 
                      { background: '#fff3cd', color: '#856404' })
                }}>
                  {item.status === 'approved' ? '✅ Approved' : 
                   item.status === 'rejected' ? '❌ Rejected' : 
                   '⏳ Pending'}
                </span>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 10, 
                marginBottom: 15, 
                fontSize: 14, 
                color: '#495057' 
              }}>
                <div><strong>Email:</strong> {item.email || item.studentEmail || 'N/A'}</div>
                <div><strong>Phone:</strong> {item.mobileNo || item.phone || 'N/A'}</div>
                <div><strong>County:</strong> {item.homeCounty || 'N/A'}</div>
                <div><strong>Pathway:</strong> {item.pathway || 'N/A'}</div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <AdminButton onClick={()=>setSelected(item)} variant="neutral">
                  👁️ View Full Details
                </AdminButton>
                {item.status !== 'approved' && (
                  <AdminButton onClick={()=>doAction(item._id,'approve')} variant="success">
                    ✅ Approve
                  </AdminButton>
                )}
                {item.status !== 'rejected' && (
                  <AdminButton onClick={()=>doAction(item._id,'reject')} variant="danger">
                    ❌ Reject
                  </AdminButton>
                )}
                <AdminButton onClick={()=>downloadAsZip(item)} variant="neutral" disabled={downloading}>
                  📥 Download ZIP
                </AdminButton>
                <AdminButton onClick={()=>doAction(item._id,'delete')} variant="danger">
                  🗑️ Delete
                </AdminButton>
              </div>
            </div>
          ))}

          {items.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 60, background: '#f8f9fa', borderRadius: 10 }}>
              <p style={{ fontSize: 64, margin: 0 }}>📭</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#495057', margin: '10px 0 5px 0' }}>No submissions found</p>
              <p style={{ fontSize: 14, color: '#6c757d', margin: 0 }}>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 25 }}>
          <AdminButton 
            disabled={page<=1} 
            onClick={()=>{ const p = Math.max(1,page-1); setPage(p); load(p); }}
          >
            ← Previous
          </AdminButton>
          <span style={{ fontSize: 14, color: '#495057' }}>Page {page} of {totalPages} ({total} total)</span>
          <AdminButton 
            disabled={page>=totalPages} 
            onClick={()=>{ const p = Math.min(totalPages,page+1); setPage(p); load(p);}}
          >
            Next →
          </AdminButton>
        </div>
      )}

      {/* Detailed View Modal */}
      {selected && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 9999, 
            padding: 20 
          }} 
          onClick={()=>setSelected(null)}
        >
          <div 
            style={{ 
              background: '#fff', 
              borderRadius: 12, 
              width: '100%', 
              maxWidth: 1000, 
              maxHeight: '90vh', 
              display: 'flex', 
              flexDirection: 'column', 
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)' 
            }} 
            onClick={(e)=>e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: 20, 
              borderBottom: '2px solid #e9ecef' 
            }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#212529' }}>📄 Application Details</h2>
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: 24, 
                  cursor: 'pointer', 
                  color: '#6c757d', 
                  padding: 0, 
                  width: 30, 
                  height: 30 
                }} 
                onClick={()=>setSelected(null)}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
              {/* Status Badge */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <span style={{
                  fontSize: 16,
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontWeight: 600,
                  ...(selected.status === 'approved' ? { background: '#d4edda', color: '#155724' } : 
                      selected.status === 'rejected' ? { background: '#f8d7da', color: '#721c24' } : 
                      { background: '#fff3cd', color: '#856404' })
                }}>
                  {selected.status === 'approved' ? '✅ APPROVED' : 
                   selected.status === 'rejected' ? '❌ REJECTED' : 
                   '⏳ PENDING REVIEW'}
                </span>
              </div>

              {/* Personal Information */}
              <DetailSection title="Personal Information">
                <DetailRow label="Full Name" value={selected.fullName} />
                <DetailRow label="Assessment No" value={selected.assessmentNo} />
                <DetailRow label="Date of Birth" value={selected.dateOfBirth} />
                <DetailRow label="Place of Birth" value={selected.placeOfBirth} />
                <DetailRow label="Gender" value={selected.gender} />
                <DetailRow label="Nationality" value={selected.nationality} />
                <DetailRow label="Birth Cert Entry No" value={selected.birthCertEntryNo} />
                <DetailRow label="Birth Cert No" value={selected.birthCertNo} />
              </DetailSection>

              {/* Location */}
              <DetailSection title="Location Details">
                <DetailRow label="Home County" value={selected.homeCounty} />
                <DetailRow label="Sub-County" value={selected.subCounty} />
                <DetailRow label="Constituency" value={selected.constituency} />
                <DetailRow label="Location" value={selected.location} />
                <DetailRow label="Sub-location/Village" value={selected.subLocation} />
                <DetailRow label="Chief's Name" value={selected.chiefName} />
                <DetailRow label="Chief's Address" value={selected.chiefAddress} />
                <DetailRow label="Sub-Chief's Name" value={selected.subChiefName} />
              </DetailSection>

              {/* Contact Information */}
              <DetailSection title="Contact Information">
                <DetailRow label="Postal Address" value={selected.postalAddress} />
                <DetailRow label="Town" value={selected.town} />
                <DetailRow label="Email" value={selected.email} />
                <DetailRow label="Mobile Number" value={selected.mobileNo || selected.phone} />
              </DetailSection>

              {/* Academic Information */}
              <DetailSection title="Academic Information">
                <DetailRow label="Junior School" value={selected.juniorSchool} />
                <DetailRow label="Junior School Address" value={selected.juniorSchoolAddress} />
                <DetailRow label="Applying For Grade" value={selected.applyingForGrade || selected.grade} />
                <DetailRow label="Pathway" value={selected.pathway} />
                <DetailRow label="Subject Combination" value={selected.subjectCombination} />
                <DetailRow label="Favourite Activity" value={selected.favouriteActivity} />
              </DetailSection>

              {/* Junior School Performance */}
              {(selected.gradeKiswahili || selected.gradeEnglish) && (
                <DetailSection title="Junior School Performance (Rubrics)">
                  <DetailRow label="Kiswahili Lugha" value={selected.gradeKiswahili} />
                  <DetailRow label="English Language" value={selected.gradeEnglish} />
                  <DetailRow label="Integrated Science" value={selected.gradeScience} />
                  <DetailRow label="Mathematics" value={selected.gradeMaths} />
                  <DetailRow label="Creative Arts & Sports" value={selected.gradeCreativeArts} />
                  <DetailRow label="Pre-Technical Studies" value={selected.gradePreTechnical} />
                  <DetailRow label="Agriculture" value={selected.gradeAgriculture} />
                  <DetailRow label="Social Studies" value={selected.gradeSocialStudies} />
                  <DetailRow label="CRE" value={selected.gradeCRE} />
                </DetailSection>
              )}

              {/* Religion */}
              {selected.religion && (
                <DetailSection title="Religion">
                  <DetailRow label="Religion" value={selected.religion} />
                  <DetailRow label="Denomination" value={selected.denomination} />
                  <DetailRow label="Year of Baptism" value={selected.yearOfBaptism} />
                </DetailSection>
              )}

              {/* Father's Information */}
              {selected.fatherName && (
                <DetailSection title="Father's Information">
                  <DetailRow label="Name" value={selected.fatherName} />
                  <DetailRow label="Occupation" value={selected.fatherOccupation} />
                  <DetailRow label="ID/Passport No" value={selected.fatherIdNo} />
                  <DetailRow label="Address" value={selected.fatherAddress} />
                  <DetailRow label="Telephone" value={selected.fatherTelephone} />
                </DetailSection>
              )}

              {/* Mother's Information */}
              {selected.motherName && (
                <DetailSection title="Mother's Information">
                  <DetailRow label="Name" value={selected.motherName} />
                  <DetailRow label="Occupation" value={selected.motherOccupation} />
                  <DetailRow label="ID/Passport No" value={selected.motherIdNo} />
                  <DetailRow label="Address" value={selected.motherAddress} />
                  <DetailRow label="Telephone" value={selected.motherTelephone} />
                </DetailSection>
              )}

              {/* Guardian's Information */}
              {selected.guardianName && (
                <DetailSection title="Guardian's Information">
                  <DetailRow label="Name" value={selected.guardianName} />
                  <DetailRow label="Occupation" value={selected.guardianOccupation} />
                  <DetailRow label="ID/Passport No" value={selected.guardianIdNo} />
                  <DetailRow label="Address" value={selected.guardianAddress} />
                  <DetailRow label="Telephone" value={selected.guardianTelephone || selected.guardianPhone} />
                  <DetailRow label="Email" value={selected.guardianEmail} />
                </DetailSection>
              )}

              {/* Medical & Special Needs */}
              {(selected.specialMedicalCondition || selected.specialNeeds) && (
                <DetailSection title="Medical & Special Needs">
                  <DetailRow label="Special Medical Condition" value={selected.specialMedicalCondition || 'None'} />
                  <DetailRow label="Special Needs" value={selected.specialNeeds || 'None'} />
                </DetailSection>
              )}

              {/* Parent Comments */}
              {(selected.parentComments || selected.message) && (
                <DetailSection title="Parent/Guardian Comments">
                  <p style={{ margin: 0, padding: 10, background: '#f8f9fa', borderRadius: 6 }}>
                    {selected.parentComments || selected.message}
                  </p>
                </DetailSection>
              )}

              {/* Uploaded Documents */}
              <DetailSection title="Uploaded Documents">
                <div style={{ display: 'grid', gap: 10 }}>
                  {renderDocumentLink('Birth Certificate', selected.birthCertificate)}
                  {renderDocumentLink('Medical Certificate', selected.medicalCertificate)}
                  {renderDocumentLink('Leaving Certificate', selected.leavingCertificate)}
                  {renderDocumentLink('Baptism Certificate', selected.baptismCertificate)}
                  {renderDocumentLink('Passport Photo 1', selected.passportPhoto1)}
                  {renderDocumentLink('Passport Photo 2', selected.passportPhoto2)}
                  {renderDocumentLink('Transfer Letter', selected.transferLetter)}
                  {renderDocumentLink('Transcript', selected.transcript)}
                  {renderDocumentLink('Certificate', selected.certificate)}
                  {renderDocumentLink('File', selected.downloadUrl || selected.url)}
                </div>
              </DetailSection>
            </div>

            {/* Modal Footer */}
            <div style={{ 
              display: 'flex', 
              gap: 10, 
              padding: 20, 
              borderTop: '2px solid #e9ecef', 
              flexWrap: 'wrap', 
              justifyContent: 'flex-end' 
            }}>
              <AdminButton onClick={()=>downloadAsPDF(selected)} variant="neutral">
                🖨️ Print / Save as PDF
              </AdminButton>
              <AdminButton onClick={()=>downloadAsZip(selected)} variant="neutral" disabled={downloading}>
                📥 Download Package (ZIP)
              </AdminButton>
              {selected.status !== 'approved' && (
                <AdminButton onClick={()=>{doAction(selected._id,'approve'); setSelected(null);}} variant="success">
                  ✅ Approve Application
                </AdminButton>
              )}
              {selected.status !== 'rejected' && (
                <AdminButton onClick={()=>{doAction(selected._id,'reject'); setSelected(null);}} variant="danger">
                  ❌ Reject Application
                </AdminButton>
              )}
              <AdminButton onClick={()=>setSelected(null)} variant="neutral">
                Close
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Helper Components
function DetailSection({ title, children }) {
  return (
    <div style={{ marginBottom: 25 }}>
      <h3 style={{ 
        fontSize: 16, 
        fontWeight: 600, 
        color: '#667eea', 
        marginBottom: 12,
        borderBottom: '2px solid #e9ecef',
        paddingBottom: 8
      }}>
        {title}
      </h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #f1f3f5' }}>
      <div style={{ flex: '0 0 200px', fontWeight: 600, color: '#495057' }}>{label}:</div>
      <div style={{ flex: 1, color: '#212529' }}>{value || '-'}</div>
    </div>
  );
}

function renderDocumentLink(label, url) {
  if (!url) return (
    <div style={{ padding: 10, background: '#f8f9fa', borderRadius: 6, color: '#6c757d' }}>
      📄 {label}: <em>Not uploaded</em>
    </div>
  );
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        padding: 10,
        background: '#e7f5ff',
        border: '1px solid #339af0',
        borderRadius: 6,
        color: '#1971c2',
        textDecoration: 'none',
        display: 'block',
        transition: 'all 0.2s'
      }}
    >
      📎 {label} → View/Download
    </a>
  );
}
