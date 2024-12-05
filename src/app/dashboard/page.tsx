import NavBar from "../../../components/NavBar";
import TodoRecorder from "../../../components/TodoRecorder";
import { TaskDashboard } from "./_components/TaskDashboard";

export default function DashboardPage() {
  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: "url('/h6.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <NavBar />
      <br />
      <br />
      <br />
      <br />
      <div className="container mx-auto px-4 py-20">
        <TodoRecorder />
        <br />
        <TaskDashboard />
        <br />
      </div>
    </div>
  );
}