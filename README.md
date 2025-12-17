CampusKeep 🏨

CampusKeep is a modern, mobile-first facility management system designed specifically for educational institutions, hostels, and large accommodation complexes. It simplifies the complex task of managing hundreds of rooms, tracking maintenance issues, and ensuring students and tenants have a safe, clean environment.

🚀 Product Pitch

Managing a campus shouldn't require clipboards, spreadsheets, and endless phone calls. CampusKeep brings your facility operations into the 21st century.

Visual Status Tracking: See the state of your entire building at a glance. Know instantly which rooms are dirty, occupied, or waiting on repairs.

Maintenance Made Simple: Log plumbing, electrical, and carpentry issues directly to a specific room. Track them from "Reported" to "Resolved" with a full audit trail.

Built for Mobile: Whether you are at your desk or walking the hallways, the responsive design ensures you have full control on any device.

Data-Driven Decisions: Export detailed CSV reports on room inventory and maintenance logs to spot trends and optimize your budget.

✨ Key Features

🏢 Facility Management

Smart Setup Wizard: Create entire buildings in seconds. Define floors and rooms-per-floor, and let the system auto-generate the room structure.

Flexible Editing: Rename facilities and renumber rooms individually or in batches to match your physical layout.

Floor-by-Floor Grouping: Organize your view logically by floors for easier navigation.

🛏️ Room Operations

Color-Coded Grid:

🔴 Red: Needs Cleaning

🟢 Green: Ready / Cleaned

🟡 Yellow: Cleaned but has Maintenance Issues

🔘 Gray: Occupied

Bulk Actions: Select multiple rooms to mark them all as "Cleaned" or "Occupied" in one go.

Inventory Control: Track base items like Beds, Mattresses, and Pillows per room.

Activity History: A detailed timeline of every cleaning and status change for accountability.

🛠️ Issue Tracker

Categorized Reporting: Log issues under categories like Plumbing, Electrical, HVAC, Carpentry, etc.

Status Workflow: Toggle issues between "Open" and "Fixed" with timestamped resolution logging.

Advanced Filtering: Filter issues by Category or Status (Open/Fixed) and sort by date or room number.

📊 Reports & Dashboard

Live Dashboard: Real-time counters for facility health, occupancy rates, and open maintenance tickets.

CSV Exports: Download comprehensive spreadsheets for:

Room Status Report: Cleaning state and inventory levels.

Issues Log: Maintenance history and resolution times.

📖 Usage Guide

1. Login

The system uses a secure Username and Access Code login.

Username: (e.g., admin)

Code: (e.g., 1234)

Note: User accounts are managed directly in the database backend.

2. Setting Up a Facility

Navigate to the Facilities tab.

Click + Add New Facility.

Enter the Name (e.g., "Block A"), Type (Accommodation), Number of Floors, and Rooms per Floor.

Click Next Step.

Review the generated room numbers. You can change the "Start Sequence" (e.g., start floor 2 at 201 instead of 200) and click Apply Range.

Click Create Facility.

3. Managing Daily Operations

Cleaning: Go to a facility view. Click on rooms to select them. Use the Bulk Action Bar at the top to click "Clean".

Occupancy: To check a student in, select the room and click "Full" (Occupied). To check them out, open the room details and click "Vacate Room".

Maintenance: If you find a broken light, click the room, go to the Issues tab in the modal, select "Electrical", describe the issue, and submit. The room will turn Yellow on the grid to alert staff.

4. Resolving Issues

Go to the Issues Tracker tab.

Filter by "Open" status.

Identify the issue and dispatch a technician.

Once fixed, click the status button to toggle it to "Fixed". The resolution time is automatically recorded.

💻 Technical Stack

Frontend: React.js (Vite/CRA compatible)

Styling: Tailwind CSS (Responsive & Utility-first)

Icons: Lucide React

Backend: Firebase (Firestore & Authentication)

🛠️ Local Development Setup

To run this project locally:

Clone the repository:

git clone [https://github.com/your-repo/campus-keep.git](https://github.com/your-repo/campus-keep.git)
cd campus-keep


Install Dependencies:

npm install firebase lucide-react


Configure Firebase:

Create a project in the Firebase Console.

Enable Firestore Database and Authentication (Anonymous provider).

Create a web app in Firebase and get your firebaseConfig object.

Replace the firebaseConfig variable in FacilityManager.jsx with your actual keys.

Create an Admin User:

In Firestore, create a collection path: artifacts/{appId}/public/data/users.

Add a document with ID admin.

Add a field code with value 1234 (or your preferred password).

Run the App:

npm start
# or
npm run dev


Built with ❤️ by nanaboison