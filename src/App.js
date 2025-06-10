import React, { useState } from 'react';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsIcon from '@mui/icons-material/Settings';

const sections = [
  { name: 'Categories', icon: <CategoryIcon fontSize="large" /> },
  { name: 'Users', icon: <PeopleIcon fontSize="large" /> },
  { name: 'Assets', icon: <InventoryIcon fontSize="large" /> },
  { name: 'Insights', icon: <InsightsIcon fontSize="large" /> },
  { name: 'Settings', icon: <SettingsIcon fontSize="large" /> },
];

const subsections = {
  Users: ['Admins', 'Schools', 'Teachers', 'Parents', 'Students'],
  Categories: ['SampleCat1', 'SampleCat2'],
  Assets: ['SampleAsset1'],
  Insights: ['SampleInsight1'],
  Settings: ['SampleSetting1'],
};

const columns = [
  'student_id', 'first_name', 'last_name', 'd_o_b', 'parent_id', 'last_loggedin', 'signup_date',
  'image_link', 'father_name', 'mother_name', 'city', 'state', 'country', 'zipcode', 'school'
];

const sampleData = {
  Users: {
    Students: Array.from({ length: 10 }, (_, i) => ({
      student_id: `S${i + 1}`,
      first_name: `First${i + 1}`,
      last_name: `Last${i + 1}`,
      d_o_b: `200${i}-01-01`,
      parent_id: `P${i + 1}`,
      last_loggedin: `2024-06-1${i}`,
      signup_date: `2024-05-2${i}`,
      image_link: `https://placehold.co/40x40?text=${i+1}`,
      father_name: `Father${i+1}`,
      mother_name: `Mother${i+1}`,
      city: `City${i+1}`,
      state: `State${i+1}`,
      country: `Country${i+1}`,
      zipcode: `1000${i}`,
      school: `School${i+1}`,
    })),
    Admins: [],
    Schools: [],
    Teachers: [],
    Parents: [],
  },
  Categories: {
    SampleCat1: [],
    SampleCat2: [],
  },
  Assets: {
    SampleAsset1: [],
  },
  Insights: {
    SampleInsight1: [],
  },
  Settings: {
    SampleSetting1: [],
  },
};

function App() {
  // Section and subsection selection
  const [selectedSection, setSelectedSection] = useState('Users');
  const [selectedSubsection, setSelectedSubsection] = useState('Students');

  // Table logic
  const [sortCol, setSortCol] = useState('student_id');
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState({});
  const [filter, setFilter] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('create'); // or 'edit'
  const [popupData, setPopupData] = useState({});
  const [tableData, setTableData] = useState(sampleData);

  // Form validation state
  const [formError, setFormError] = useState('');
  // Loading state for export
  const [exporting, setExporting] = useState(false);

  // Get data for current section/subsection
  const data = tableData[selectedSection]?.[selectedSubsection] || [];

  // Filter/search/sort logic
  let filtered = data.filter(row =>
    columns.every(col => {
      const searchVal = search[col]?.toLowerCase() || '';
      const filterVal = filter[col] || '';
      const cell = (row[col] || '').toString().toLowerCase();
      const searchMatch = !searchVal || cell.includes(searchVal);
      const filterMatch = !filterVal || cell === filterVal;
      return searchMatch && filterMatch;
    })
  );
  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      if (a[sortCol] < b[sortCol]) return sortDir === 'asc' ? -1 : 1;
      if (a[sortCol] > b[sortCol]) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Row selection logic
  const allSelected = filtered.length > 0 && selectedRows.length === filtered.length;
  const toggleRow = id => {
    setSelectedRows(rows =>
      rows.includes(id) ? rows.filter(r => r !== id) : [...rows, id]
    );
  };
  const toggleAll = () => {
    setSelectedRows(allSelected ? [] : filtered.map(row => row.student_id));
  };

  // Helper: Validate popup data
  const validatePopupData = () => {
    if (!popupData.first_name || !popupData.last_name) {
      setFormError('First name and last name are required.');
      return false;
    }
    setFormError('');
    return true;
  };

  // Popup logic
  const openPopup = (mode, row) => {
    setPopupMode(mode);
    setPopupData(row || {});
    setFormError('');
    setShowPopup(true);
  };
  const closePopup = () => {
    setShowPopup(false);
    setPopupData({});
  };
  const handleSave = () => {
    if (!validatePopupData()) return;
    setTableData(prev => {
      const updated = { ...prev };
      const arr = [...(updated[selectedSection][selectedSubsection] || [])];
      if (popupMode === 'edit') {
        const idx = arr.findIndex(r => r.student_id === popupData.student_id);
        if (idx !== -1) arr[idx] = { ...popupData };
      } else {
        arr.push({ ...popupData, student_id: popupData.student_id || `S${arr.length + 1}` });
      }
      updated[selectedSection][selectedSubsection] = arr;
      return updated;
    });
    closePopup();
  };
  const handleDelete = () => {
    setTableData(prev => {
      const updated = { ...prev };
      updated[selectedSection][selectedSubsection] = (updated[selectedSection][selectedSubsection] || []).filter(row => !selectedRows.includes(row.student_id));
      return updated;
    });
    setSelectedRows([]);
  };
  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const rows = filtered;
      const csv = [columns.join(',')].concat(
        rows.map(row => columns.map(col => JSON.stringify(row[col] || '')).join(','))
      ).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedSubsection}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 800); // Simulate loading
  };

  // Render
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f3f3f3', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 100, background: '#000', color: '#666', display: 'flex', flexDirection: 'column',
        borderRight: '1px solid #666', alignItems: 'center', overflowY: 'auto', overflowX: 'hidden'
      }}>
        <div style={{
          padding: '2rem 0 1rem 0', color: '#fff', fontWeight: 800, fontSize: '1.2rem',
          borderBottom: '1px solid #666', width: '100%', textAlign: 'center'
        }}>
          ADMIN
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {sections.map((section, idx) => (
            <div
              key={section.name + idx}
              style={{
                background: selectedSection === section.name ? '#fff' : '#000',
                color: selectedSection === section.name ? '#000' : '#666',
                padding: '1rem 0 0.2rem 0', borderBottom: '1px solid #666', cursor: 'pointer',
                fontWeight: selectedSection === section.name ? 700 : 500, textAlign: 'center'
              }}
              onClick={() => {
                setSelectedSection(section.name);
                setSelectedSubsection(subsections[section.name]?.[0] || '');
                setSelectedRows([]);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center' }}>{section.icon}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{section.name}</div>
            </div>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main style={{ flex: 1, background: '#f3f3f3', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* SubsectionTabs (now at the top) */}
        <div style={{
          display: 'flex', background: '#d9d9d9', padding: '0.5rem 2rem', gap: 16, overflowX: 'auto', overflowY: 'auto', alignItems: 'center'
        }}>
          {subsections[selectedSection]?.map(sub => (
            <div
              key={sub}
              style={{
                background: selectedSubsection === sub ? '#fff' : 'transparent',
                color: selectedSubsection === sub ? '#000' : '#666',
                padding: '0.6rem 1.5rem',
                borderRadius: 8,
                fontWeight: selectedSubsection === sub ? 700 : 500,
                cursor: 'pointer',
                fontSize: 16,
                boxShadow: selectedSubsection === sub ? '0 2px 8px #eee' : 'none',
                border: selectedSubsection === sub ? '1px solid #f3f3f3' : 'none',
                marginBottom: selectedSubsection === sub ? -8 : 0,
                flexShrink: 0
              }}
              onClick={() => {
                setSelectedSubsection(sub);
                setSelectedRows([]);
              }}
            >{sub}</div>
          ))}
          {/* Profile button at the end of SubsectionTabs */}
          <div style={{ marginLeft: 'auto', cursor: 'pointer', color: '#333', fontWeight: 700, border: '1px solid #666', borderRadius: 8, padding: '0.5rem 1rem', background: '#000', color: '#fff', flexShrink: 0 }}>
            <i className="fas fa-user-circle"></i> Profile
          </div>
        </div>
        {/* Top Bar (now below SubsectionTabs) */}
        <div style={{
          display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f3f3f3',
          padding: '1rem 2rem', overflowX: 'auto', minWidth: 0
        }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }}>
            {selectedSection}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto', flexShrink: 0 }}>
            <button
              style={{ background: '#d9ead3', color: '#333', border: 'none', borderRadius: 4, padding: '0.5rem 1.2rem', fontWeight: 700, marginRight: 8, minWidth: 100 }}
              onClick={() => openPopup('create')}
            >+ Create New</button>
            <button
              style={{ background: selectedRows.length === 1 ? '#d9d9d9' : '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '0.5rem 1.2rem', fontWeight: 700, marginRight: 8, minWidth: 80 }}
              disabled={selectedRows.length !== 1}
              onClick={() => openPopup('edit', filtered.find(row => row.student_id === selectedRows[0]))}
            >Edit</button>
            <button
              style={{ background: '#f3f3f3', color: '#333', border: 'none', borderRadius: 4, padding: '0.5rem 1.2rem', fontWeight: 700, marginRight: 8, minWidth: 80, position: 'relative' }}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? <span className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></span> : null}
              Export
            </button>
            <button
              style={{ background: selectedRows.length > 0 ? '#f4cccc' : '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '0.5rem 1.2rem', fontWeight: 700, minWidth: 80 }}
              disabled={selectedRows.length === 0}
              onClick={handleDelete}
            >- Delete</button>
          </div>
        </div>
        {/* Data Table */}
        <div style={{
          flex: 1, background: '#fff', margin: '2rem', borderRadius: 12, boxShadow: '0 2px 8px #eee',
          border: '1px solid #f3f3f3', padding: '1.5rem', position: 'relative', minWidth: 0, minHeight: 0, overflow: 'hidden'
        }}>
          <div style={{
            width: '100%', height: '100%', overflow: 'auto', position: 'relative'
          }}>
            <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
                <tr>
                  <th style={{
                    position: 'sticky', left: 0, zIndex: 3, background: '#fff', borderRight: '1px solid #f3f3f3',
                    padding: '0.7rem', border: 'none', verticalAlign: 'bottom'
                  }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                  </th>
                  {columns.map((col, idx) => (
                    <th key={col} style={{
                      padding: '0.7rem', border: 'none', minWidth: 120, verticalAlign: 'bottom', textAlign: 'left', background: '#fff',
                      position: idx === 0 ? 'sticky' : 'static', left: idx === 0 ? 0 : undefined, zIndex: idx === 0 ? 2 : 1, borderRight: idx === 0 ? '1px solid #f3f3f3' : undefined
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
                        <span>{col}</span>
                        <span
                          style={{ fontSize: 13, color: '#aaa', cursor: 'pointer', marginLeft: 2, display: 'flex', alignItems: 'center' }}
                          onClick={() => {
                            if (sortCol === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
                            else setSortCol(col);
                          }}
                        >
                          <i className={`fas fa-sort${sortCol === col ? (sortDir === 'asc' ? '-up' : '-down') : ''}`} style={{ fontSize: 13 }}></i>
                        </span>
                      </div>
                      <div style={{ position: 'relative', marginTop: 2, display: 'flex', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="search"
                          value={search[col] || ''}
                          onChange={e => setSearch(s => ({ ...s, [col]: e.target.value }))}
                          style={{ width: '100%', fontSize: 13, padding: '6px 28px 6px 8px', border: '1px solid #eee', borderRadius: 6, background: '#fafafa', boxSizing: 'border-box' }}
                        />
                        <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <span className="material-icons" style={{ fontSize: 18 }}>filter_alt</span>
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.student_id} style={{ color: '#666', background: selectedRows.includes(row.student_id) ? '#e6f7ff' : 'transparent' }}>
                    <td style={{
                      position: 'sticky', left: 0, zIndex: 1, background: '#fff', borderRight: '1px solid #f3f3f3',
                      padding: '0.7rem', border: '1px solid #f3f3f3'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.student_id)}
                        onChange={() => toggleRow(row.student_id)}
                      />
                    </td>
                    {columns.map(col => (
                      <td key={col} style={{
                        padding: '0.7rem', border: '1px solid #f3f3f3',
                        position: col === 'student_id' ? 'sticky' : 'static', left: col === 'student_id' ? 0 : undefined, background: col === 'student_id' ? '#fff' : undefined, zIndex: col === 'student_id' ? 1 : undefined
                      }}>
                        {col === 'image_link'
                          ? <img src={row[col]} alt="img" style={{ width: 32, height: 32, borderRadius: 4 }} />
                          : row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Popup for Create/Edit */}
          {showPopup && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end'
            }}>
              <div style={{
                width: 400, background: '#fff', borderRadius: '1rem 0 0 1rem', margin: '2rem 0 2rem 0',
                boxShadow: '0 4px 24px #bbb', padding: '2rem 2rem 1rem 2rem', minHeight: 500, display: 'flex', flexDirection: 'column',
                maxHeight: '90vh', overflowY: 'auto' // Make popup scrollable on small screens
              }}>
                <div style={{ fontWeight: 700, fontSize: 18, background: '#000', color: '#fff', padding: '1rem', borderRadius: '0.7rem 0.7rem 0 0', margin: '-2rem -2rem 1rem -2rem' }}>
                  {popupMode === 'edit' ? `Edit ${popupData.student_id}` : 'Create New Student'}
                </div>
                {/* Show form error if validation fails */}
                {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}
                <table style={{ width: '100%', marginBottom: 24 }}>
                  <tbody>
                    {columns.map(col => (
                      <tr key={col}>
                        <td style={{ fontWeight: 600, textTransform: 'capitalize', padding: '0.5rem 0.5rem 0.5rem 0', width: 120 }}>{col.replace(/_/g, ' ')}</td>
                        <td>
                          {col === 'image_link'
                            ? <input type="text" value={popupData[col] || ''} onChange={e => setPopupData(d => ({ ...d, [col]: e.target.value }))} placeholder="Image URL" style={{ width: '100%' }} />
                            : <input type="text" value={popupData[col] || ''} onChange={e => setPopupData(d => ({ ...d, [col]: e.target.value }))} style={{ width: '100%' }} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                  <button style={{ background: '#d9ead3', color: '#333', border: 'none', borderRadius: 6, padding: '0.7rem 2rem', fontWeight: 700, fontSize: 16 }} onClick={handleSave}>Save</button>
                  <button style={{ background: '#f4cccc', color: '#333', border: 'none', borderRadius: 6, padding: '0.7rem 2rem', fontWeight: 700, fontSize: 16 }} onClick={closePopup}>Skip</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
