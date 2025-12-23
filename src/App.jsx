import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  Wrench, 
  FileSpreadsheet, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Search, 
  Filter,
  History,
  Bed,
  MoreVertical,
  LogOut,
  Download,
  ArrowLeft,
  Menu,
  Lock,
  User,
  ChevronRight,
  ChevronLeft,
  Hash,
  Pencil,
  Calendar,
  Clock,
  ArrowUpDown,
  PieChart,
  BarChart3,
  RefreshCw,
  Package,
  Zap,
  Box,
  Warehouse,
  Minus
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc,
  serverTimestamp,
  where,
  writeBatch,
  getDoc,
  getDocs
} from 'firebase/firestore';

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyB_VT79e-TNY82kKaQiKYuDeLypT7u-Qe0",
  authDomain: "campuskeep-akonu1.firebaseapp.com",
  projectId: "campuskeep-akonu1",
  storageBucket: "campuskeep-akonu1.firebasestorage.app",
  messagingSenderId: "39587484854",
  appId: "1:39587484854:web:8e9765f22248204a334217"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.projectId;

// --- Helper Functions ---
const getCollectionPath = (collectionName, userId) => {
  if (!userId) throw new Error("User ID required for path generation");
  return `artifacts/${appId}/users/${userId}/${collectionName}`;
};

const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  // Flatten data for CSV
  const flattenedData = data.map(row => {
    const flatRow = {};
    Object.keys(row).forEach(key => {
      if (typeof row[key] === 'object' && row[key] !== null) {
        Object.keys(row[key]).forEach(subKey => {
          flatRow[`${key}_${subKey}`] = row[key][subKey];
        });
      } else {
        flatRow[key] = row[key];
      }
    });
    return flatRow;
  });

  const headers = Object.keys(flattenedData[0]);
  const csvContent = [
    headers.join(','),
    ...flattenedData.map(row => headers.map(fieldName => 
      JSON.stringify(row[fieldName] || '')
    ).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// --- Components ---

// 1. Sidebar Component
const Sidebar = ({ activeView, setActiveView, onLogout, username }) => (
  <div className="hidden md:flex w-64 bg-slate-900 text-white flex-col h-full shadow-xl">
    <div className="p-6 border-b border-slate-800">
      <div className="flex items-center gap-3">
        {/* Replace this URL with your logo */}
        <img 
          src="/campuskeep_logo.png" 
          alt="Campus Logo" 
          className="w-8 h-8 object-contain bg-white/10 rounded p-1"
        />
        <h1 className="text-xl font-bold tracking-tight">CampusKeep</h1>
      </div>
      <p className="text-xs text-slate-400 mt-2">Campus Management System</p>
    </div>
    
    <nav className="flex-1 p-4 space-y-2">
      <NavButton 
        icon={<LayoutDashboard size={20} />} 
        label="Dashboard" 
        active={activeView === 'dashboard'} 
        onClick={() => setActiveView('dashboard')} 
      />
      <NavButton 
        icon={<Building2 size={20} />} 
        label="Buildings & Rooms" 
        active={activeView === 'buildings'} 
        onClick={() => setActiveView('buildings')} 
      />
      <NavButton 
        icon={<Wrench size={20} />} 
        label="Issues Tracker" 
        active={activeView === 'issues'} 
        onClick={() => setActiveView('issues')} 
      />
      <NavButton 
        icon={<FileSpreadsheet size={20} />} 
        label="Reports & Export" 
        active={activeView === 'reports'} 
        onClick={() => setActiveView('reports')} 
      />
    </nav>

    <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-slate-400 text-sm mb-3">
            <span className="flex items-center gap-2 truncate">
                <User size={14} /> {username}
            </span>
        </div>
        <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 text-slate-300 rounded-lg transition-colors text-sm font-medium"
        >
            <LogOut size={16} /> Logout
        </button>
        <div className="text-[10px] text-slate-600 mt-4 pl-1">Powered By nanaboison (stephen.nanaboison@gmail.com)</div>
    </div>
  </div>
);

// 1.5 Mobile Navigation
const MobileNav = ({ activeView, setActiveView, onLogout }) => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 text-white flex justify-around items-center p-2 z-40 border-t border-slate-800 pb-safe shadow-lg">
    <MobileNavButton 
      icon={<LayoutDashboard size={24} />} 
      label="Dash" 
      active={activeView === 'dashboard'} 
      onClick={() => setActiveView('dashboard')} 
    />
    <MobileNavButton 
      icon={<Building2 size={24} />} 
      label="Facilities" 
      active={activeView === 'buildings'} 
      onClick={() => setActiveView('buildings')} 
    />
    <MobileNavButton 
      icon={<Wrench size={24} />} 
      label="Issues" 
      active={activeView === 'issues'} 
      onClick={() => setActiveView('issues')} 
    />
    <MobileNavButton 
      icon={<FileSpreadsheet size={24} />} 
      label="Reports" 
      active={activeView === 'reports'} 
      onClick={() => setActiveView('reports')} 
    />
    <MobileNavButton 
      icon={<LogOut size={24} className="text-red-400" />} 
      label="Exit" 
      active={false}
      onClick={onLogout} 
    />
  </div>
);

const MobileNavButton = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
      active ? 'text-blue-400' : 'text-slate-500'
    }`}
  >
    {icon}
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </button>
);

const NavButton = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

// 2. Dashboard View
const DashboardView = ({ buildings, rooms, issues }) => {
  const stats = useMemo(() => {
    const s = {
      facilities: buildings.length,
      rooms: 0,
      utilityRooms: 0,
      roomsByState: { 'Cleaned': 0, 'Not Cleaned': 0, 'Occupied': 0 },
      issuesByCategory: {},
      issuesOpen: 0,
      issuesFixed: 0
    };

    rooms.forEach(r => {
      // Split count by type
      if (r.type === 'Utility') {
          s.utilityRooms++;
      } else {
          s.rooms++; // Accommodation
      }

      // Track state for all rooms (Cleanliness applies to both)
      // For Occupied, we might only care about Accommodation, but if a utility room is flagged Occupied (in use), we count it here for the chart
      // but we will separate the top card count.
      if (s.roomsByState[r.state] !== undefined) s.roomsByState[r.state]++;
      else s.roomsByState[r.state] = (s.roomsByState[r.state] || 0) + 1; 
    });

    issues.forEach(i => {
      const cat = i.category || 'Uncategorized';
      s.issuesByCategory[cat] = (s.issuesByCategory[cat] || 0) + 1;

      if (i.status === 'Open') s.issuesOpen++;
      else if (i.status === 'Fixed') s.issuesFixed++;
    });

    return s;
  }, [buildings, rooms, issues]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <PieChart className="text-slate-400" /> Dashboard
        </h2>

        {/* Top Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-slate-800">{stats.facilities}</div>
            <div className="text-xs text-slate-500 uppercase font-bold mt-1">Facilities</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-800">{stats.rooms}</span>
                <span className="text-sm font-semibold text-slate-400">+{stats.utilityRooms}</span>
            </div>
            <div className="text-xs text-slate-500 uppercase font-bold mt-1">Units + Utility</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-orange-600">{stats.issuesOpen}</div>
            <div className="text-xs text-slate-500 uppercase font-bold mt-1">Open Issues</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-green-600">{stats.issuesFixed}</div>
            <div className="text-xs text-slate-500 uppercase font-bold mt-1">Resolved Issues</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room States */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Bed size={18} /> Room Status Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="font-medium text-slate-700">Not Cleaned</span>
                  </div>
                  <span className="font-bold text-xl text-slate-800">{stats.roomsByState['Not Cleaned'] || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium text-slate-700">Cleaned</span>
                  </div>
                  <span className="font-bold text-xl text-slate-800">{stats.roomsByState['Cleaned'] || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span className="font-medium text-slate-700">Occupied</span>
                  </div>
                  <span className="font-bold text-xl text-slate-800">{stats.roomsByState['Occupied'] || 0}</span>
              </div>
            </div>
          </div>

          {/* Issue Categories */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} /> Issues by Category
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(stats.issuesByCategory).map(([cat, count]) => (
                  <div key={cat} className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-slate-800 mb-1">{count}</span>
                    <span className="text-xs text-slate-500 uppercase font-bold">{cat}</span>
                  </div>
              ))}
              {Object.keys(stats.issuesByCategory).length === 0 && (
                  <div className="col-span-2 text-center text-slate-400 py-8">No issues recorded yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Setup & Buildings View
const BuildingsView = ({ buildings, rooms, issues, setNotification, userId }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [editingBuilding, setEditingBuilding] = useState(null);

  // Filter rooms for selected building
  const buildingRooms = useMemo(() => 
    rooms.filter(r => r.buildingId === selectedBuilding?.id).sort((a,b) => {
        // Try sort by number if numeric, else string
        const numA = parseInt(a.number);
        const numB = parseInt(b.number);
        if(!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return String(a.number).localeCompare(String(b.number));
    }),
  [rooms, selectedBuilding]);

  const handleCreateFacility = async (data) => {
    try {
        // 1. Create Building
        const docRef = await addDoc(collection(db, getCollectionPath('buildings', userId)), {
            name: data.name,
            type: data.type,
            floors: data.floors,
            roomsPerFloor: data.roomsPerFloor, // Save this for future edits
            createdAt: serverTimestamp()
        });

        // 2. Create Rooms if Accommodation
        if (data.type === 'Accommodation' && data.roomsData) {
            const batch = writeBatch(db);
            Object.keys(data.roomsData).forEach(floorNum => {
                const floorRooms = data.roomsData[floorNum];
                floorRooms.forEach(room => {
                    const newRoomRef = doc(collection(db, getCollectionPath('rooms', userId)));
                    batch.set(newRoomRef, {
                        buildingId: docRef.id,
                        buildingName: data.name,
                        floor: parseInt(floorNum),
                        number: room.number, 
                        type: 'Accommodation', // Default type for auto-generated
                        state: 'Not Cleaned',
                        items: data.baseInventory || { beds: 2, pillows: 2, mattress: 2 },
                        lastCleaned: null
                    });
                });
            });
            await batch.commit();
        }
        setNotification({ type: 'success', message: 'Facility created successfully!' });
        setShowAddModal(false);
    } catch(e) {
        console.error(e);
        setNotification({ type: 'error', message: 'Failed to create facility' });
    }
  };

  const handleEditFacility = async (data) => {
    try {
        const buildingRef = doc(db, getCollectionPath('buildings', userId), data.id);
        
        // 1. Update Building Meta
        await updateDoc(buildingRef, {
            name: data.name,
            type: data.type
        });

        // 2. Update Rooms if roomsData is provided (changed numbers/names)
        if (data.type === 'Accommodation' && data.roomsData) {
            const batch = writeBatch(db);
            
            // Iterate through all floors in the editor
            Object.keys(data.roomsData).forEach(floorNum => {
                const floorRooms = data.roomsData[floorNum];
                floorRooms.forEach(room => {
                    if (room.id && !room.id.startsWith('temp_')) {
                        // Existing room - update its number and sync building name
                        const roomRef = doc(db, getCollectionPath('rooms', userId), room.id);
                        
                        const updates = { 
                            number: room.number,
                            buildingName: data.name 
                        };

                        // Update inventory if baseInventory was changed/provided
                        if (data.baseInventory) {
                            updates.items = data.baseInventory;
                        }

                        batch.update(roomRef, updates);
                    }
                });
            });
            
            await batch.commit();
        } else if (data.name !== editingBuilding.name) {
             // Fallback: If only name changed and no room data passed (e.g. non-accom), update links
             const relatedRooms = rooms.filter(r => r.buildingId === data.id);
             if(relatedRooms.length > 0) {
                 const batch = writeBatch(db);
                 relatedRooms.forEach(r => {
                     batch.update(doc(db, getCollectionPath('rooms', userId), r.id), { buildingName: data.name });
                 });
                 await batch.commit();
             }
        }

        setNotification({ type: 'success', message: 'Facility updated successfully' });
        setEditingBuilding(null);
    } catch (e) {
        console.error(e);
        setNotification({ type: 'error', message: 'Failed to update facility' });
    }
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col overflow-hidden pb-20 md:pb-6">
      <div className={`flex justify-between items-center mb-4 md:mb-6 ${selectedBuilding ? 'hidden md:flex' : 'flex'}`}>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Facilities</h2>
          <p className="text-xs md:text-sm text-slate-500">Manage buildings & rooms.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm md:text-base md:px-4 md:py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={18} /> <span className="hidden md:inline">Add New Facility</span><span className="md:hidden">Add</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-6 overflow-hidden">
        {/* List of Buildings - Hidden on mobile if building selected */}
        <div className={`w-full md:w-1/3 overflow-y-auto pr-2 space-y-3 ${selectedBuilding ? 'hidden md:block' : 'block'}`}>
          {buildings.map(b => (
            <div 
              key={b.id} 
              onClick={() => setSelectedBuilding(b)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedBuilding?.id === b.id 
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500' 
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-700">{b.name}</h3>
                <div className="flex items-center gap-2">
                    {/* Edit Button */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingBuilding(b);
                        }}
                        className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        title="Edit Facility"
                    >
                        <Pencil size={14} />
                    </button>
                    <span className="text-[10px] md:text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600 uppercase tracking-wider font-semibold">
                        {b.type}
                    </span>
                </div>
              </div>
              <div className="text-sm text-slate-500 flex justify-between">
                <span>{b.floors} Floors</span>
                {b.type === 'Accommodation' && (
                  <span>
                    {rooms.filter(r => r.buildingId === b.id).length} Rooms
                  </span>
                )}
              </div>
            </div>
          ))}
          {buildings.length === 0 && (
            <div className="text-center p-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              No buildings found. Add one.
            </div>
          )}
        </div>

        {/* Room Grid View - Full screen on mobile if building selected */}
        <div className={`w-full md:w-2/3 bg-slate-50 md:rounded-2xl md:border border-slate-200 p-2 md:p-6 overflow-hidden flex flex-col ${selectedBuilding ? 'block flex-1' : 'hidden md:flex'}`}>
          {selectedBuilding ? (
            selectedBuilding.type === 'Accommodation' ? (
              <RoomManager 
                building={selectedBuilding} 
                rooms={buildingRooms} 
                issues={issues}
                setNotification={setNotification}
                onBack={() => setSelectedBuilding(null)}
                userId={userId}
              />
            ) : (
              <div className="flex flex-col h-full">
                 <button onClick={() => setSelectedBuilding(null)} className="md:hidden mb-4 flex items-center gap-2 text-slate-500">
                    <ArrowLeft size={20} /> Back
                 </button>
                 <div className="flex flex-col items-center justify-center flex-1 text-slate-400 text-center">
                    <Building2 size={48} className="mb-4 opacity-50" />
                    <p>Select an Accommodation building to manage rooms.</p>
                    <p className="text-sm mt-2">Walkways and Halls are managed via Issues Tracker.</p>
                 </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <LayoutDashboard size={48} className="mb-4 opacity-50" />
              <p>Select a building to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Unified Facility Wizard (Create & Edit) */}
      {(showAddModal || editingBuilding) && (
        <FacilityConfigWizard 
            isEditing={!!editingBuilding}
            initialBuilding={editingBuilding}
            initialRooms={editingBuilding ? rooms.filter(r => r.buildingId === editingBuilding.id) : []}
            onClose={() => {
                setShowAddModal(false);
                setEditingBuilding(null);
            }}
            onComplete={editingBuilding ? handleEditFacility : handleCreateFacility}
        />
      )}
    </div>
  );
};

// --- Config Wizard Component (Handles Add & Edit) ---
const FacilityConfigWizard = ({ onClose, onComplete, isEditing = false, initialBuilding = null, initialRooms = [] }) => {
    const [step, setStep] = useState(1);
    
    // Calculate default rooms per floor for edit mode if missing
    const calculateDefaultRPF = () => {
        if (!isEditing || !initialBuilding?.floors || initialRooms.length === 0) return 10;
        if (initialBuilding.roomsPerFloor) return initialBuilding.roomsPerFloor;
        // Estimate if not saved previously
        const roomsOnFirstFloor = initialRooms.filter(r => r.floor === 1).length;
        return roomsOnFirstFloor > 0 ? roomsOnFirstFloor : 10;
    };

    const [draftBuilding, setDraftBuilding] = useState({
        name: initialBuilding?.name || '',
        type: initialBuilding?.type || 'Accommodation',
        floors: initialBuilding?.floors || 1,
        roomsPerFloor: calculateDefaultRPF(),
        ...initialBuilding // Merge any other existing props (like id)
    });
    
    const [baseInventory, setBaseInventory] = useState({ beds: 1, pillows: 1, mattress: 1 });
    
    // Structure: { 1: [{ number: '101' }, { number: '102'}], 2: [...] }
    const [draftRooms, setDraftRooms] = useState({});
    const [activeFloor, setActiveFloor] = useState(1);
    const [rangeStart, setRangeStart] = useState('');

    useEffect(() => {
        if (isEditing && initialRooms.length > 0) {
            // Populate base inventory from first room if available
            // Prefer items from Accommodation rooms as they are standard
            const sampleRoom = initialRooms.find(r => r.type !== 'Utility') || initialRooms[0];
            if (sampleRoom && sampleRoom.items) {
                setBaseInventory(sampleRoom.items);
            }

            // Group existing rooms by floor for the wizard
            const grouped = {};
            // Initialize arrays for all floors defined in building
            for(let f = 1; f <= draftBuilding.floors; f++) grouped[f] = [];
            
            initialRooms.forEach(room => {
                // Only include Accommodation rooms in the bulk numbering tool to avoid messing up Utility rooms
                if (room.type === 'Utility') return; 

                if(!grouped[room.floor]) grouped[room.floor] = [];
                grouped[room.floor].push({ ...room }); // Clone room data
            });
            
            // Sort rooms by number inside floors
            Object.keys(grouped).forEach(f => {
                grouped[f].sort((a,b) => {
                    const nA = parseInt(a.number);
                    const nB = parseInt(b.number);
                    return (!isNaN(nA) && !isNaN(nB)) ? nA - nB : String(a.number).localeCompare(String(b.number));
                });
            });

            setDraftRooms(grouped);
            // Auto set range start based on first room of first floor
            if (grouped[1] && grouped[1].length > 0) {
                setRangeStart(grouped[1][0].number);
            }
        }
    }, [isEditing, initialRooms, draftBuilding.floors]);

    const generateInitialDraft = () => {
        if (isEditing && Object.keys(draftRooms).length > 0) return;

        const rooms = {};
        for(let f = 1; f <= draftBuilding.floors; f++) {
            rooms[f] = [];
            for(let r = 1; r <= draftBuilding.roomsPerFloor; r++) {
                rooms[f].push({ 
                    id: `temp_${Math.random().toString(36)}`, 
                    number: (f * 100) + r 
                });
            }
        }
        setDraftRooms(rooms);
        setRangeStart((1 * 100) + 1); 
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (draftBuilding.type !== 'Accommodation') {
            onComplete({ ...draftBuilding, roomsData: null });
        } else {
            // Flow: 1 -> 2 (Inventory) -> 3 (Room Config)
            if (step === 1) {
                if (!isEditing) generateInitialDraft();
                setStep(2);
            } else if (step === 2) {
                setStep(3);
            }
        }
    };

    const handleRangeApply = () => {
        const start = parseInt(rangeStart);
        if (isNaN(start)) return;
        
        const updatedRooms = draftRooms[activeFloor].map((room, index) => ({
            ...room,
            number: start + index
        }));
        
        setDraftRooms({
            ...draftRooms,
            [activeFloor]: updatedRooms
        });
    };

    const handleRoomNumberChange = (floor, index, val) => {
        const newRooms = [...draftRooms[floor]];
        newRooms[index].number = val;
        setDraftRooms({
            ...draftRooms,
            [floor]: newRooms
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:w-[800px] flex flex-col h-[85vh] md:max-h-[90vh] animate-in slide-in-from-bottom md:zoom-in duration-200">
                
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">
                            {isEditing ? 'Edit Facility' : 'New Facility Details'}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {step === 1 ? 'Basic Details' : step === 2 ? 'Base Inventory' : 'Room Configuration'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {step === 1 && (
                        <div className="p-8 overflow-y-auto">
                            <form id="step1-form" onSubmit={handleNext} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Facility Name</label>
                                    <input 
                                        required 
                                        value={draftBuilding.name}
                                        onChange={e => setDraftBuilding({...draftBuilding, name: e.target.value})}
                                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="e.g. Block A, Science Hall" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Facility Type</label>
                                    <select 
                                        value={draftBuilding.type}
                                        onChange={e => setDraftBuilding({...draftBuilding, type: e.target.value})}
                                        className="w-full border border-slate-300 rounded-lg p-3 bg-white"
                                    >
                                        <option value="Accommodation">Accommodation (Has Rooms)</option>
                                        <option value="TeachingHall">Teaching Hall</option>
                                        <option value="Walkway">Walkway</option>
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Number of Floors</label>
                                        <input 
                                            required 
                                            type="number" 
                                            min="1" 
                                            max="50"
                                            disabled={isEditing} 
                                            title={isEditing ? "Structure changes disabled in edit mode" : ""}
                                            value={draftBuilding.floors}
                                            onChange={e => setDraftBuilding({...draftBuilding, floors: parseInt(e.target.value) || 1})}
                                            className={`w-full border border-slate-300 rounded-lg p-3 ${isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`} 
                                        />
                                    </div>
                                    {draftBuilding.type === 'Accommodation' && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Rooms per Floor</label>
                                            <input 
                                                required 
                                                type="number" 
                                                min="1" 
                                                max="100"
                                                disabled={isEditing} 
                                                title={isEditing ? "Structure changes disabled in edit mode" : ""}
                                                value={draftBuilding.roomsPerFloor}
                                                onChange={e => setDraftBuilding({...draftBuilding, roomsPerFloor: parseInt(e.target.value) || 1})}
                                                className={`w-full border border-slate-300 rounded-lg p-3 ${isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`} 
                                            />
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <p className="text-xs text-orange-500 bg-orange-50 p-2 rounded">
                                        Note: Changing floors or room counts is disabled to protect existing room data. You can rename rooms in the next step.
                                    </p>
                                )}
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="p-8 overflow-y-auto">
                            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Package className="text-blue-500" /> Default Room Inventory
                            </h4>
                            <p className="text-sm text-slate-500 mb-6">Set the default items for each room. You can change this later for individual rooms.</p>
                            
                            <form id="step2-form" onSubmit={handleNext} className="space-y-6 max-w-md">
                                <div className="grid grid-cols-1 gap-4">
                                    {['beds', 'pillows', 'mattress'].map(item => (
                                        <div key={item} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                            <label className="capitalize font-bold text-slate-700">{item}</label>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => setBaseInventory(p => ({...p, [item]: Math.max(0, p[item]-1)}))} className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-slate-100">-</button>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    value={baseInventory[item]}
                                                    onChange={e => setBaseInventory(p => ({...p, [item]: parseInt(e.target.value) || 0}))}
                                                    className="w-16 text-center p-1 border rounded bg-white font-bold"
                                                />
                                                <button type="button" onClick={() => setBaseInventory(p => ({...p, [item]: p[item]+1}))} className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-slate-100">+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {step === 3 && (
                        <div className="flex flex-1 overflow-hidden h-full">
                            {/* Left Col: Floors List */}
                            <div className="w-1/3 border-r border-slate-200 bg-slate-50 overflow-y-auto p-4 space-y-2 flex-shrink-0">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Floor</h4>
                                {Object.keys(draftRooms).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => {
                                            setActiveFloor(f);
                                            setRangeStart(draftRooms[f][0]?.number || '');
                                        }}
                                        className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-all ${
                                            activeFloor.toString() === f.toString() 
                                                ? 'bg-blue-600 text-white shadow-md' 
                                                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                                        }`}
                                    >
                                        <span className="font-bold">Floor {f}</span>
                                        <ChevronRight size={16} className={activeFloor.toString() === f.toString() ? 'opacity-100' : 'opacity-20'} />
                                    </button>
                                ))}
                            </div>

                            {/* Right Col: Room Editor - Scroll Fixed */}
                            <div className="w-2/3 flex flex-col h-full overflow-hidden">
                                {/* Auto-Fill Toolbar */}
                                <div className="p-4 border-b border-slate-200 bg-white flex items-end gap-3 flex-shrink-0">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Start Sequence (Floor {activeFloor})</label>
                                        <div className="relative">
                                            <Hash size={16} className="absolute left-3 top-3 text-slate-400" />
                                            <input 
                                                type="number"
                                                value={rangeStart}
                                                onChange={(e) => setRangeStart(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                placeholder="e.g. 101"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleRangeApply}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 h-10"
                                    >
                                        Apply Range
                                    </button>
                                </div>

                                {/* Room Grid Inputs - Scrollable Area */}
                                <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
                                    <div className="grid grid-cols-3 gap-4 pb-10">
                                        {draftRooms[activeFloor]?.map((room, idx) => (
                                            <div key={room.id || idx} className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                                <label className="block text-[10px] font-bold text-slate-400 mb-1">Room {idx + 1}</label>
                                                <input 
                                                    value={room.number}
                                                    onChange={(e) => handleRoomNumberChange(activeFloor, idx, e.target.value)}
                                                    className="w-full text-center font-bold text-slate-800 border-b border-slate-200 focus:border-blue-500 outline-none pb-1"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t bg-white flex justify-end gap-3 rounded-b-2xl flex-shrink-0">
                    {step > 1 && (
                        <button 
                            onClick={() => setStep(s => s - 1)}
                            className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg flex items-center gap-2"
                        >
                            <ChevronLeft size={18} /> Back
                        </button>
                    )}
                    <button 
                        onClick={(e) => {
                            if (step === 1 && draftBuilding.type === 'Accommodation') {
                                document.getElementById('step1-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                            } else if (step === 2) {
                                document.getElementById('step2-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                            } else {
                                onComplete({ ...draftBuilding, roomsData: draftRooms, baseInventory });
                            }
                        }}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2"
                    >
                        {step < 3 && draftBuilding.type === 'Accommodation' ? (
                             <>Next Step <ChevronRight size={18} /></>
                        ) : (isEditing ? 'Save Changes' : 'Create Facility')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- New Component: Add Room Modal (Handles Dynamic Inventory) ---
const AddRoomModal = ({ floor, buildingId, buildingName, onClose, setNotification, userId }) => {
    const [roomData, setRoomData] = useState({
        number: '',
        type: 'Accommodation'
    });
    
    // Inventory state for Utility rooms: array of {id, name, quantity}
    const [utilityInventory, setUtilityInventory] = useState([
        { id: '1', name: 'Broom', quantity: 1 }
    ]);

    const handleAddUtilityItem = () => {
        setUtilityInventory([...utilityInventory, { id: Math.random().toString(), name: '', quantity: 1 }]);
    };

    const handleRemoveUtilityItem = (id) => {
        setUtilityInventory(utilityInventory.filter(item => item.id !== id));
    };

    const handleUtilityItemChange = (id, field, value) => {
        setUtilityInventory(utilityInventory.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Construct items object
            let items = {};
            if (roomData.type === 'Accommodation') {
                items = { beds: 1, pillows: 1, mattress: 1 };
            } else {
                // Convert array to map for utility items
                utilityInventory.forEach(item => {
                    if(item.name.trim()) items[item.name] = parseInt(item.quantity) || 0;
                });
            }

            await addDoc(collection(db, getCollectionPath('rooms', userId)), {
                buildingId,
                buildingName,
                floor,
                number: roomData.number,
                type: roomData.type,
                state: 'Not Cleaned',
                items,
                lastCleaned: null
            });
            setNotification({ type: 'success', message: 'Room added successfully' });
            onClose();
        } catch (e) {
            console.error(e);
            setNotification({ type: 'error', message: 'Failed to add room' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                <h3 className="text-lg font-bold mb-4 flex-shrink-0">Add Room to Floor {floor}</h3>
                <div className="flex-1 overflow-y-auto">
                    <form id="add-room-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Room Number / Name</label>
                            <input 
                                required 
                                value={roomData.number}
                                onChange={e => setRoomData({...roomData, number: e.target.value})}
                                className="w-full border p-2 rounded-lg" 
                                placeholder="e.g. 101 or Store A" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select 
                                value={roomData.type}
                                onChange={e => setRoomData({...roomData, type: e.target.value})}
                                className="w-full border p-2 rounded-lg bg-white"
                            >
                                <option value="Accommodation">Accommodation</option>
                                <option value="Utility">Utility / Service</option>
                            </select>
                        </div>

                        {roomData.type === 'Utility' && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Inventory</label>
                                    <button type="button" onClick={handleAddUtilityItem} className="text-xs text-blue-600 font-bold hover:underline">+ Add Item</button>
                                </div>
                                <div className="space-y-2">
                                    {utilityInventory.map((item, idx) => (
                                        <div key={item.id} className="flex gap-2 items-center">
                                            <input 
                                                placeholder="Item Name" 
                                                className="flex-1 border p-1.5 rounded text-sm"
                                                value={item.name}
                                                onChange={e => handleUtilityItemChange(item.id, 'name', e.target.value)}
                                            />
                                            <input 
                                                type="number" 
                                                min="0" 
                                                className="w-16 border p-1.5 rounded text-sm text-center"
                                                value={item.quantity}
                                                onChange={e => handleUtilityItemChange(item.id, 'quantity', e.target.value)}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveUtilityItem(item.id)}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {utilityInventory.length === 0 && <p className="text-xs text-slate-400 italic text-center py-2">No items</p>}
                                </div>
                            </div>
                        )}
                    </form>
                </div>
                <div className="flex justify-end gap-2 mt-6 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button type="submit" form="add-room-form" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
                </div>
            </div>
        </div>
    );
};

// 3. Room Manager
const RoomManager = ({ building, rooms, issues, setNotification, onBack, userId }) => {
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [addingRoomFloor, setAddingRoomFloor] = useState(null); 

  // Keep viewingRoom synced with real-time data
  useEffect(() => {
    if (viewingRoom) {
      const updated = rooms.find(r => r.id === viewingRoom.id);
      if (updated) setViewingRoom(updated);
    }
  }, [rooms, viewingRoom?.id]);

  // Group rooms by floor
  const roomsByFloor = useMemo(() => {
    const grouped = {};
    rooms.forEach(room => {
      const floor = room.floor; 
      if (!grouped[floor]) grouped[floor] = [];
      grouped[floor].push(room);
    });
    return grouped;
  }, [rooms]);

  // NEW: Calculate Stats based on visual state and TYPE
  const stats = useMemo(() => {
    let counts = {
        occupied: 0,
        dirty: 0,
        ready: 0,
        issue: 0 
    };
    
    rooms.forEach(room => {
        // Utility rooms don't count towards 'Occupied' stats usually, but they do count for cleaning/issues
        if (room.state === 'Occupied' && room.type !== 'Utility') {
             // Only Accommodation rooms should really be 'Occupied', but if a utility room is marked occupied (maybe storing stuff), count it?
             // Let's count it to reflect visual state.
            counts.occupied++;
        } else if (room.state === 'Not Cleaned') {
            counts.dirty++;
        } else {
            const hasIssue = issues.some(i => i.roomId === room.id && i.status !== 'Fixed');
            if (hasIssue) counts.issue++;
            else counts.ready++;
        }
    });
    return counts;
  }, [rooms, issues]);

  const getRoomColor = (room) => {
    const isUtility = room.type === 'Utility';
    const baseStyle = isUtility ? 'border-dashed border-2' : 'border-2';

    if (room.state === 'Occupied') return `${baseStyle} bg-gray-500 border-gray-600 text-white`;
    if (room.state === 'Not Cleaned') return `${baseStyle} bg-red-500 border-red-600 text-white`;
    if (room.state === 'Cleaned') {
      const roomIssues = issues.filter(i => i.roomId === room.id && i.status !== 'Fixed');
      if (roomIssues.length > 0) return `${baseStyle} bg-yellow-400 border-yellow-500 text-slate-900`; 
      return `${baseStyle} bg-green-500 border-green-600 text-white`;
    }
    return `${baseStyle} bg-slate-200 border-slate-300 text-slate-500`; 
  };

  const getRoomIcon = (room) => {
      if (room.type === 'Utility') return <Box size={20} className="opacity-80" />;
      return <span className="text-lg md:text-xl font-bold">{room.number}</span>;
  }

  const toggleSelectRoom = (roomId) => {
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms(selectedRooms.filter(id => id !== roomId));
    } else {
      setSelectedRooms([...selectedRooms, roomId]);
    }
  };

  const handleBulkStateChange = async (newState) => {
    if (selectedRooms.length === 0) return;
    try {
      const batch = writeBatch(db);
      selectedRooms.forEach(roomId => {
        const ref = doc(db, getCollectionPath('rooms', userId), roomId);
        const updates = { state: newState };
        if (newState === 'Cleaned') {
          updates.lastCleaned = serverTimestamp();
        }
        batch.update(ref, updates);
        
        const historyRef = doc(collection(db, getCollectionPath('history', userId)));
        batch.set(historyRef, {
            roomId,
            type: 'STATE_CHANGE',
            details: `Status changed to ${newState}`,
            timestamp: serverTimestamp()
        });
      });
      await batch.commit();
      setNotification({ type: 'success', message: `Updated ${selectedRooms.length} rooms` });
      setSelectedRooms([]);
    } catch (e) {
      setNotification({ type: 'error', message: 'Update failed' });
    }
  };
  
  const handleAddSingleRoom = async (data) => {
      try {
          await addDoc(collection(db, getCollectionPath('rooms', userId)), {
              buildingId: building.id,
              buildingName: building.name,
              floor: data.floor,
              number: data.number,
              type: data.type,
              state: 'Not Cleaned',
              items: data.type === 'Accommodation' ? { beds: 1, pillows: 1, mattress: 1 } : {}, // Default items
              lastCleaned: null
          });
          setNotification({ type: 'success', message: 'Room added successfully' });
          setAddingRoomFloor(null);
      } catch (e) {
          setNotification({ type: 'error', message: 'Failed to add room' });
      }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-2 mb-4 pb-2 md:pb-4 border-b border-slate-200">
        {/* ... Header and Stats ... */}
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="md:hidden p-1 -ml-1 text-slate-600">
                <ArrowLeft />
            </button>
            <h3 className="font-bold text-lg leading-none">{building.name}</h3>
        </div>

        <div className="flex justify-between items-end">
            <div className="flex flex-wrap gap-2 md:gap-4 mt-2 text-[10px] md:text-xs font-medium">
                <span className="flex items-center gap-1"><div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></div> Dirty <span className="text-slate-500">({stats.dirty})</span></span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full"></div> Issue <span className="text-slate-500">({stats.issue})</span></span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full"></div> Ready <span className="text-slate-500">({stats.ready})</span></span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 md:w-3 md:h-3 bg-gray-500 rounded-full"></div> Full <span className="text-slate-500">({stats.occupied})</span></span>
            </div>
            <div className="text-[10px] md:text-xs font-bold text-slate-400">
                Total: {rooms.length}
            </div>
        </div>
        
        {selectedRooms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg shadow-sm border mt-2">
            <span className="text-xs md:text-sm font-bold text-slate-700 px-1">{selectedRooms.length} selected</span>
            <div className="flex gap-1">
                <button onClick={() => handleBulkStateChange('Cleaned')} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Clean</button>
                <button onClick={() => handleBulkStateChange('Not Cleaned')} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Dirty</button>
                <button onClick={() => handleBulkStateChange('Occupied')} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Full</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-10 px-1">
        {Object.keys(roomsByFloor).sort((a,b) => parseInt(a) - parseInt(b)).map(floor => (
            <div key={floor} className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="bg-slate-200 px-2 py-1 rounded">Floor {floor}</span>
                    </h4>
                    <button 
                        onClick={() => setAddingRoomFloor(parseInt(floor))}
                        className="text-xs flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    >
                        <Plus size={14} /> Add Room
                    </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
                {roomsByFloor[floor].map(room => (
                    <div 
                    key={room.id}
                    onClick={() => setViewingRoom(room)}
                    className={`relative aspect-square rounded-lg md:rounded-xl flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-all ${getRoomColor(room)}`}
                    >
                    <input 
                        type="checkbox" 
                        className="absolute top-1 left-1 md:top-2 md:left-2 w-4 h-4 rounded border-white/50 cursor-pointer"
                        checked={selectedRooms.includes(room.id)}
                        onClick={(e) => { e.stopPropagation(); toggleSelectRoom(room.id); }}
                        onChange={() => {}} 
                    />
                    
                    {getRoomIcon(room)}
                    
                    {room.type === 'Utility' && <span className="text-[10px] font-bold mt-1 max-w-[90%] truncate">{room.number}</span>}

                    <span className="hidden md:block text-[10px] uppercase opacity-90 mt-1 font-medium">{room.state}</span>
                    
                    <div className="absolute bottom-1 right-1 md:bottom-2 md:left-2 flex gap-1">
                        {issues.some(i => i.roomId === room.id && i.status !== 'Fixed') && (
                            <AlertTriangle size={14} className="text-white drop-shadow-md" />
                        )}
                    </div>
                    </div>
                ))}
                </div>
            </div>
        ))}
        {rooms.length === 0 && (
            <div className="text-center py-10 text-slate-400">No rooms found in this facility.</div>
        )}
      </div>

      {/* REPLACED inline Add Single Room Modal with extracted component */}
      {addingRoomFloor && (
          <AddRoomModal 
              floor={addingRoomFloor}
              buildingId={building.id}
              buildingName={building.name}
              userId={userId}
              onClose={() => setAddingRoomFloor(null)}
              setNotification={setNotification}
          />
      )}

      {viewingRoom && (
         <RoomDetailModal 
            room={viewingRoom} 
            issues={issues.filter(i => i.roomId === viewingRoom.id)}
            onClose={() => setViewingRoom(null)}
            setNotification={setNotification}
            userId={userId}
         />
      )}
    </div>
  );
};

// 5. Room Detail Modal (History, Inventory, Actions)
const RoomDetailModal = ({ room, issues, onClose, setNotification, userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newIssue, setNewIssue] = useState({ category: 'General', description: '' });
  const [roomHistory, setRoomHistory] = useState([]);
  
  // Custom inventory state for Utility rooms
  // Transform object to array for editing: { broom: 2 } -> [{name: 'broom', quantity: 2}]
  const [customItems, setCustomItems] = useState(() => {
      if (room.type === 'Utility' && room.items) {
          return Object.entries(room.items).map(([name, quantity], idx) => ({
              id: idx.toString(), name, quantity
          }));
      }
      return [];
  });

  const activeIssues = issues.filter(i => i.status === 'Open');
  const resolvedIssues = issues.filter(i => i.status === 'Fixed');

  // Fetch History specific to this room
  useEffect(() => {
    const q = query(
        collection(db, getCollectionPath('history', userId)), 
        where('roomId', '==', room.id),
        orderBy('timestamp', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
        setRoomHistory(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return () => unsub();
  }, [room.id, userId]);

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    try {
        const batch = writeBatch(db);
        const roomRef = doc(db, getCollectionPath('rooms', userId), room.id);
        let updates = {};
        let changesLog = [];

        if (room.type === 'Utility') {
            // Convert custom items array back to object
            let itemsMap = {};
            customItems.forEach(i => {
                if (i.name.trim()) itemsMap[i.name] = parseInt(i.quantity) || 0;
            });
            updates = { items: itemsMap };

            // Diff for history
            const oldItems = room.items || {};
            const allKeys = new Set([...Object.keys(itemsMap), ...Object.keys(oldItems)]);
            
            allKeys.forEach(key => {
                 const oldVal = oldItems[key];
                 const newVal = itemsMap[key];
                 if (oldVal !== newVal) {
                     if (oldVal === undefined) changesLog.push(`Added ${key} (${newVal})`);
                     else if (newVal === undefined) changesLog.push(`Removed ${key}`);
                     else changesLog.push(`${key}: ${oldVal} → ${newVal}`);
                 }
            });

        } else {
            // Standard accom inventory
            const fd = new FormData(e.target);
            updates = {
                items: {
                    'beds': parseInt(fd.get('beds')),
                    'pillows': parseInt(fd.get('pillows')),
                    'mattress': parseInt(fd.get('mattress'))
                }
            };
        }

        batch.update(roomRef, updates);

        // Add history log for Utility rooms if there are changes
        if (room.type === 'Utility' && changesLog.length > 0) {
            const historyRef = doc(collection(db, getCollectionPath('history', userId)));
            batch.set(historyRef, {
                roomId: room.id,
                type: 'INVENTORY_UPDATE',
                details: `Inventory: ${changesLog.join(', ')}`,
                timestamp: serverTimestamp()
            });
        }
        
        await batch.commit();
        setNotification({ type: 'success', message: 'Inventory updated' });
    } catch (e) {
        console.error(e);
        setNotification({ type: 'error', message: 'Failed to update inventory' });
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, getCollectionPath('issues', userId)), {
        roomId: room.id,
        roomNumber: room.number,
        buildingId: room.buildingId,
        category: newIssue.category,
        description: newIssue.description,
        status: 'Open',
        reportedAt: serverTimestamp()
      });
      setNewIssue({ category: 'General', description: '' });
      setNotification({ type: 'success', message: 'Issue reported' });
    } catch(e) {
      setNotification({ type: 'error', message: 'Failed to report issue' });
    }
  };

  const handleStateUpdate = async (newState) => {
      try {
        const batch = writeBatch(db);
        const roomRef = doc(db, getCollectionPath('rooms', userId), room.id);
        
        const updates = { state: newState };
        if (newState === 'Cleaned') updates.lastCleaned = serverTimestamp();
        
        batch.update(roomRef, updates);
        
        const historyRef = doc(collection(db, getCollectionPath('history', userId)));
        batch.set(historyRef, {
            roomId: room.id,
            type: 'STATE_CHANGE',
            details: `Status changed to ${newState}`,
            timestamp: serverTimestamp()
        });
        
        await batch.commit();
        setNotification({type: 'success', message: `Marked as ${newState}`});
      } catch (e) {
        setNotification({type: 'error', message: 'Failed to update'});
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 md:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col h-[85vh] md:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-4 md:p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                {room.type === 'Utility' ? <span className="flex items-center gap-2"><Box /> {room.number}</span> : `Room ${room.number}`}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-wide">
                    {room.type || 'Accommodation'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide inline-block ${
                room.state === 'Occupied' ? 'bg-gray-200 text-gray-700' : 
                room.state === 'Not Cleaned' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                {room.state}
                </span>
                {room.lastCleaned && (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock size={10} /> Cleaned: {room.lastCleaned?.toDate().toLocaleDateString()}
                    </span>
                )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
            <XCircle size={24} />
          </button>
        </div>

        <div className="flex border-b px-6">
          {['overview', 'issues', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-6 overflow-y-auto flex-1 pb-10">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Inventory Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                        {room.type === 'Utility' ? <Package size={18} /> : <Bed size={18} />} 
                        {room.type === 'Utility' ? 'Supplies & Inventory' : 'Base Items Inventory'}
                    </h4>
                </div>
                
                <form onSubmit={handleUpdateInventory}>
                    {room.type === 'Utility' ? (
                        // Dynamic List for Utility
                        <div className="space-y-3">
                            {customItems.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input 
                                        placeholder="Item Name" 
                                        className="flex-1 border p-2 rounded text-sm"
                                        value={item.name}
                                        onChange={e => {
                                            const newItems = [...customItems];
                                            newItems[idx].name = e.target.value;
                                            setCustomItems(newItems);
                                        }}
                                    />
                                    <input 
                                        type="number" 
                                        className="w-16 border p-2 rounded text-sm text-center"
                                        value={item.quantity}
                                        onChange={e => {
                                            const newItems = [...customItems];
                                            newItems[idx].quantity = e.target.value;
                                            setCustomItems(newItems);
                                        }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setCustomItems(customItems.filter((_, i) => i !== idx))}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <button 
                                type="button" 
                                onClick={() => setCustomItems([...customItems, {name: '', quantity: 1}])}
                                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-2"
                            >
                                <Plus size={14} /> Add Item row
                            </button>
                        </div>
                    ) : (
                        // Fixed List for Accommodation
                        <div className="grid grid-cols-3 gap-4">
                            {['beds', 'pillows', 'mattress'].map(item => (
                                <div key={item}>
                                <label className="block text-xs uppercase text-slate-500 font-bold mb-1">{item}</label>
                                <input 
                                    name={item}
                                    type="number"
                                    defaultValue={room.items?.[item] || 0}
                                    className="w-full border rounded p-2 text-center font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="text-right mt-4">
                        <button type="submit" className="text-sm text-blue-600 hover:underline font-medium">Save Inventory Changes</button>
                    </div>
                </form>
              </div>

              {/* State Controls */}
              <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={() => handleStateUpdate('Cleaned')}
                    className="p-3 bg-green-50 text-green-700 rounded-xl font-medium border border-green-200 hover:bg-green-100 text-center"
                 >
                    Mark Cleaned
                 </button>
                 <button 
                    onClick={() => handleStateUpdate('Not Cleaned')}
                    className="p-3 bg-red-50 text-red-700 rounded-xl font-medium border border-red-200 hover:bg-red-100 text-center"
                 >
                    Mark Not Cleaned
                 </button>
                 
                 <button 
                    onClick={() => handleStateUpdate(room.state === 'Occupied' ? 'Not Cleaned' : 'Occupied')}
                    className={`col-span-2 p-3 rounded-xl font-medium border text-center transition-colors ${
                        room.state === 'Occupied' 
                        ? 'bg-gray-800 text-white border-gray-900 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                 >
                    {room.state === 'Occupied' ? 'Vacate (Set to Not Cleaned)' : 'Mark as Occupied / In Use'}
                 </button>
              </div>
            </div>
          )}
          
          {/* ... Issues and History tabs ... */}
          {activeTab === 'issues' && (
            <div className="space-y-6">
               <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <h4 className="font-bold text-slate-700 mb-3">Report New Issue</h4>
                  <form onSubmit={handleReportIssue} className="space-y-3">
                    <select 
                      className="w-full p-2 border rounded-lg bg-slate-50"
                      value={newIssue.category}
                      onChange={e => setNewIssue({...newIssue, category: e.target.value})}
                    >
                      {['Plumbing', 'Electrical', 'Carpentry', 'AC', 'General'].map(c => <option key={c}>{c}</option>)}
                    </select>
                    <textarea 
                      placeholder="Describe the problem..."
                      className="w-full p-2 border rounded-lg bg-slate-50"
                      required
                      value={newIssue.description}
                      onChange={e => setNewIssue({...newIssue, description: e.target.value})}
                    />
                    <button className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800">Submit Report</button>
                  </form>
               </div>

               <div>
                 <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500"/> Active Issues
                 </h4>
                 {activeIssues.length === 0 ? (
                   <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-lg text-sm border border-dashed">No active issues</div>
                 ) : (
                   <div className="space-y-2">
                     {activeIssues.map(i => (
                       <div key={i.id} className="flex justify-between items-start p-3 bg-red-50 rounded-lg border border-red-100">
                          <div>
                            <div className="font-bold text-sm text-slate-800">{i.category}</div>
                            <div className="text-sm text-slate-600">{i.description}</div>
                            <div className="text-xs text-slate-400 mt-1">{i.reportedAt?.toDate().toLocaleDateString()}</div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded font-bold bg-red-200 text-red-700">
                            {i.status}
                          </span>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               {resolvedIssues.length > 0 && (
                   <div>
                     <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500"/> Resolved History
                     </h4>
                     <div className="space-y-2">
                       {resolvedIssues.map(i => (
                         <div key={i.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg border border-slate-200 opacity-75">
                            <div>
                              <div className="font-bold text-sm text-slate-700">{i.category}</div>
                              <div className="text-sm text-slate-500">{i.description}</div>
                              <div className="text-xs text-slate-400 mt-1">Fixed: {i.resolvedAt?.toDate().toLocaleDateString()}</div>
                            </div>
                            <span className="text-xs px-2 py-1 rounded font-bold bg-green-100 text-green-700">
                              {i.status}
                            </span>
                         </div>
                       ))}
                     </div>
                   </div>
               )}
            </div>
          )}

          {activeTab === 'history' && (
              <div className="space-y-4">
                  <h4 className="font-bold text-slate-700 mb-3">Activity Log</h4>
                  {roomHistory.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg">No history recorded</div>
                  ) : (
                      <div className="space-y-3">
                          {roomHistory.map(entry => (
                              <div key={entry.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                  <div className={`mt-1 p-1.5 rounded-full ${
                                      entry.details?.includes('Cleaned') ? 'bg-green-100 text-green-600' : 
                                      entry.details?.includes('Occupied') ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'
                                  }`}>
                                      {entry.details?.includes('Cleaned') ? <CheckCircle2 size={14} /> : <History size={14} />}
                                  </div>
                                  <div>
                                      <p className="text-sm text-slate-700 font-medium">{entry.details}</p>
                                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                          <Calendar size={10} /> 
                                          {entry.timestamp?.toDate().toLocaleDateString()} 
                                          <span className="opacity-50">|</span> 
                                          <Clock size={10} /> 
                                          {entry.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 6. Reports View
const ReportsView = ({ rooms, issues, userId }) => {
  const [cleaningFilter, setCleaningFilter] = useState({
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
  });
  const [cleaningLogs, setCleaningLogs] = useState([]);
  const [loadingCleaning, setLoadingCleaning] = useState(false);
  const [buildingFilter, setBuildingFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  const fetchCleaningLogs = async () => {
      setLoadingCleaning(true);
      try {
          const start = new Date(cleaningFilter.start);
          start.setHours(0,0,0,0);
          const end = new Date(cleaningFilter.end);
          end.setHours(23,59,59,999);
          
          const historyRef = collection(db, getCollectionPath('history', userId));
          const q = query(
              historyRef, 
              where('timestamp', '>=', start),
              where('timestamp', '<=', end),
              orderBy('timestamp', 'desc')
          );
          
          const snapshot = await getDocs(q);
          const logs = snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(log => log.details && log.details.includes('Cleaned'));
              
          const enrichedLogs = logs.map(log => {
              const room = rooms.find(r => r.id === log.roomId);
              return {
                  ...log,
                  roomNumber: room ? room.number : 'Unknown',
                  buildingName: room ? room.buildingName : 'Unknown'
              };
          });
          
          setCleaningLogs(enrichedLogs);
      } catch (error) {
          console.error("Error fetching cleaning logs", error);
      } finally {
          setLoadingCleaning(false);
      }
  };

  const uniqueBuildings = useMemo(() => ['All', ...new Set(rooms.map(r => r.buildingName))].sort(), [rooms]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedLogs = useMemo(() => {
      let logs = [...cleaningLogs];
      
      if (buildingFilter !== 'All') {
          logs = logs.filter(l => l.buildingName === buildingFilter);
      }

      logs.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'timestamp') {
            aVal = aVal?.toDate ? aVal.toDate().getTime() : 0;
            bVal = bVal?.toDate ? bVal.toDate().getTime() : 0;
        } else {
             if (typeof aVal === 'string') aVal = aVal.toLowerCase();
             if (typeof bVal === 'string') bVal = bVal.toLowerCase();
             
             if (sortConfig.key === 'roomNumber') {
                 const aNum = parseInt(aVal);
                 const bNum = parseInt(bVal);
                 if(!isNaN(aNum) && !isNaN(bNum)) {
                     aVal = aNum;
                     bVal = bNum;
                 }
             }
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });

      return logs;
  }, [cleaningLogs, buildingFilter, sortConfig]);

  const prepareRoomsExport = () => {
    return rooms.map(r => ({
      buildingName: r.buildingName,
      floor: r.floor,
      number: r.number,
      type: r.type || 'Accommodation', // Add Type
      state: r.state,
      items_beds: r.items?.beds || 0,
      items_mattress: r.items?.mattress || 0,
      items_pillows: r.items?.pillows || 0
    }));
  };

  const prepareIssuesExport = () => {
    return issues.map(i => ({
      category: i.category,
      roomNumber: i.roomNumber,
      description: i.description,
      reportedOn: i.reportedAt ? i.reportedAt.toDate().toLocaleString() : '',
      status: i.status,
      resolvedOn: i.resolvedAt ? i.resolvedAt.toDate().toLocaleString() : ''
    }));
  };

  const prepareCleaningExport = () => {
      return processedLogs.map(l => ({
          Building: l.buildingName,
          Room: l.roomNumber,
          Time: l.timestamp?.toDate().toLocaleString()
      }));
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24 md:pb-8 space-y-6">
        <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Reports</h2>
            <p className="text-slate-500">Download facility data for analysis.</p>
        </div>

        {/* Standard Reports */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6"> 
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col"> 
          <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2 md:mb-4"> 
            <Building2 size={16} className="md:w-6 md:h-6" /> 
          </div>
          <h3 className="text-sm md:text-lg font-bold text-slate-800 mb-1 md:mb-2">Room Status</h3> 
          <p className="text-slate-500 text-xs md:text-sm mb-3 md:mb-6 hidden md:block"> 
            Export a list of all rooms, cleaning state, inventory counts.
          </p>
          <button 
            onClick={() => downloadCSV(prepareRoomsExport(), `rooms_export_${new Date().toISOString().split('T')[0]}.csv`)}
            className="mt-auto w-full py-2 md:py-3 bg-slate-900 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors text-xs md:text-base"
          >
            <Download size={14} className="md:w-[18px] md:h-[18px]" /> <span className="hidden md:inline">Download CSV</span><span className="md:hidden">CSV</span>
          </button>
        </div>

        {/* Similar for Issues Log */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-2 md:mb-4">
             <AlertTriangle size={16} className="md:w-6 md:h-6" />
          </div>
          <h3 className="text-sm md:text-lg font-bold text-slate-800 mb-1 md:mb-2">Issues Log</h3>
          <p className="text-slate-500 text-xs md:text-sm mb-3 md:mb-6 hidden md:block">
            Export all reported issues and resolution status.
          </p>
          <button 
            onClick={() => downloadCSV(prepareIssuesExport(), `issues_export_${new Date().toISOString().split('T')[0]}.csv`)}
            className="mt-auto w-full py-2 md:py-3 bg-slate-900 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors text-xs md:text-base"
          >
            <Download size={14} className="md:w-[18px] md:h-[18px]" /> <span className="hidden md:inline">Download CSV</span><span className="md:hidden">CSV</span>
          </button>
        </div>
      </div>

        {/* Cleaning Activity Report Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                    <History size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Cleaning Activity Log</h3>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-500 mb-1">From Date</label>
                            <input 
                                type="date" 
                                value={cleaningFilter.start}
                                onChange={(e) => setCleaningFilter({...cleaningFilter, start: e.target.value})}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-500 mb-1">To Date</label>
                            <input 
                                type="date" 
                                value={cleaningFilter.end}
                                onChange={(e) => setCleaningFilter({...cleaningFilter, end: e.target.value})}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                            />
                        </div>
                        <button 
                            onClick={fetchCleaningLogs}
                            disabled={loadingCleaning}
                            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loadingCleaning ? <RefreshCw size={18} className="animate-spin" /> : 'Generate Report'}
                        </button>
                    </div>

                    {cleaningLogs.length > 0 && (
                        <div className="w-full">
                             <label className="block text-xs font-bold text-slate-500 mb-1">Filter by Building</label>
                             <select 
                                value={buildingFilter}
                                onChange={(e) => setBuildingFilter(e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm bg-white"
                             >
                                 {uniqueBuildings.map(b => (
                                     <option key={b} value={b}>{b}</option>
                                 ))}
                             </select>
                        </div>
                    )}
                </div>
            </div>

            {cleaningLogs.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                        <div className="text-sm font-bold text-slate-700">Found {processedLogs.length} records</div>
                        <button 
                            onClick={() => downloadCSV(prepareCleaningExport(), `cleaning_report_${cleaningFilter.start}_to_${cleaningFilter.end}.csv`)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm text-sm"
                        >
                            <Download size={16} /> Export Data
                        </button>
                    </div>
                    {/* Removed max-h-64 and overflow-y-auto to allow full height expansion */}
                    <div className="border rounded-lg overflow-hidden"> 
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th 
                                        className="p-3 cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort('buildingName')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Building {sortConfig.key === 'buildingName' && <ArrowUpDown size={14} />}
                                        </div>
                                    </th>
                                    <th 
                                        className="p-3 cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort('roomNumber')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Room {sortConfig.key === 'roomNumber' && <ArrowUpDown size={14} />}
                                        </div>
                                    </th>
                                    <th 
                                        className="p-3 cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort('timestamp')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Time {sortConfig.key === 'timestamp' && <ArrowUpDown size={14} />}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {processedLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="p-3 text-slate-500">{log.buildingName || '-'}</td>
                                        <td className="p-3 font-bold text-slate-700">{log.roomNumber}</td>
                                        <td className="p-3 text-slate-500">{log.timestamp?.toDate().toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

// 7. Login Component
const LoginScreen = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onLogin(username, code);
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-900 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="bg-blue-600 p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-xl mx-auto flex items-center justify-center mb-4">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">CampusKeep</h1>
                    <p className="text-blue-100 text-sm mt-1">Facility Management System</p>
                </div>
                
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                            <input 
                                type="text" 
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Access Code</label>
                            <input 
                                type="password" 
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your code"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                                <AlertTriangle size={16} /> {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'Verifying...' : 'Login System'}
                        </button>
                    </form>
                    <p className="text-center text-xs text-slate-400 mt-6">
                        Authorized personnel only.
                    </p>
                </div>
            </div>
        </div>
    );
};

// 8. Main App (Authenticated)
const MainApp = ({ user, username, onLogout }) => {
    const [activeView, setActiveView] = useState('buildings');
    const [notification, setNotification] = useState(null);
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [issues, setIssues] = useState([]);
    
    // Listeners
    useEffect(() => {
        if (!username) return;

        const unsubBuildings = onSnapshot(query(collection(db, getCollectionPath('buildings', username)), orderBy('createdAt', 'desc')), 
        (snap) => setBuildings(snap.docs.map(d => ({id: d.id, ...d.data()}))),
        (err) => console.error("Buildings Error:", err)
        );

        const unsubRooms = onSnapshot(collection(db, getCollectionPath('rooms', username)), 
        (snap) => setRooms(snap.docs.map(d => ({id: d.id, ...d.data()}))),
        (err) => console.error("Rooms Error:", err)
        );

        const unsubIssues = onSnapshot(query(collection(db, getCollectionPath('issues', username)), orderBy('reportedAt', 'desc')), 
        (snap) => setIssues(snap.docs.map(d => ({id: d.id, ...d.data()}))),
        (err) => console.error("Issues Error:", err)
        );

        return () => { unsubBuildings(); unsubRooms(); unsubIssues(); };
    }, [username]);

    // Auto-dismiss notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    return (
        <div className="flex h-screen w-full bg-slate-100 font-sans text-slate-900 overflow-hidden">
            <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={onLogout} username={username} />
            
            <main className="flex-1 h-full overflow-hidden relative w-full">
                {activeView === 'dashboard' && <DashboardView buildings={buildings} rooms={rooms} issues={issues} />}
                
                {activeView === 'buildings' && (
                <BuildingsView 
                    buildings={buildings} 
                    rooms={rooms} 
                    issues={issues} 
                    setNotification={setNotification} 
                    userId={username}
                />
                )}

                {activeView === 'issues' && (
                <IssuesView 
                    rooms={rooms} 
                    issues={issues} 
                    setNotification={setNotification} 
                    userId={username}
                />
                )}

                {activeView === 'reports' && <ReportsView rooms={rooms} issues={issues} userId={username} />}

                <MobileNav activeView={activeView} setActiveView={setActiveView} onLogout={onLogout} />

                {/* Global Notification Toast */}
                {notification && (
                <div className={`fixed bottom-20 md:bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 z-[100] ${
                    notification.type === 'success' ? 'bg-slate-900 text-green-400' : 'bg-red-600 text-white'
                }`}>
                    {notification.type === 'success' ? <CheckCircle2 /> : <AlertTriangle />}
                    <span className="font-medium">{notification.message}</span>
                </div>
                )}
            </main>
        </div>
    );
};

// --- Main Container ---
export default function FacilityManager() {
  const [user, setUser] = useState(null); // Firebase Auth User
  const [loggedInUser, setLoggedInUser] = useState(null); // App-level Username
  const [loading, setLoading] = useState(true);

  // Auth & Data Fetching
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    // Check for persisted session
    const storedUser = localStorage.getItem('campusKeep_user');
    if (storedUser) {
        setLoggedInUser(storedUser);
    }
    
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleLogin = async (usernameInput, codeInput) => {
      // 1. Check if user document exists in 'public/users' collection
      // Expects: artifacts/{appId}/public/users/{username} -> { code: "..." }
      // FIX: Add 'data' segment to ensure even number of path segments (Collection -> Doc -> Collection -> Doc -> Collection -> Doc)
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', usernameInput);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.code === codeInput) {
              setLoggedInUser(usernameInput); // Success
              localStorage.setItem('campusKeep_user', usernameInput); // Persist session
          } else {
              throw new Error("Invalid access code.");
          }
      } else {
          // NOTE: For debugging in this specific environment where creating admin tools is hard,
          // You might uncomment this to "auto-create" a user if it doesn't exist.
          // await setDoc(userRef, { code: codeInput }); 
          // setLoggedInUser(usernameInput);
          throw new Error("User not found.");
      }
  };

  const handleLogout = () => {
      setLoggedInUser(null);
      localStorage.removeItem('campusKeep_user'); // Clear session
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">Loading CampusKeep...</div>;

  // If not authenticated with Firebase at all (rare)
  if (!user) return <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">Connecting to Server...</div>;

  // If Firebase connected but no Username/Code entered yet
  if (!loggedInUser) return <LoginScreen onLogin={handleLogin} />;

  // Main App
  return <MainApp user={user} username={loggedInUser} onLogout={handleLogout} />;
}