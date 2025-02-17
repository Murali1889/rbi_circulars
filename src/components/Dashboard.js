import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
const DashboardLayout = ({ children }) => {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Navbar />
          <main className="">
            {children}
          </main>
        </div>
      </div>
    );
  };


export default DashboardLayout;