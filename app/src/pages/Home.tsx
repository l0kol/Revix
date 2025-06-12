import Navbar from "../components/Navbar";
import YoutubeVideoListProps from "../components/GetYoutubeData";

console.log(import.meta.env.VITE_TEST_TOKEN);

export default function Home() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <div className="content-container">
          {/* <h1>Welcome to Revix</h1>
          <p>
            Connect your YouTube account and register your videos as
            Intelecatual Property on Story network.
          </p> */}
          <h1 className="text-3xl font-bold mb-4">Your youtube videos</h1>
          <YoutubeVideoListProps
            accessToken={import.meta.env.VITE_TEST_TOKEN}
          />
        </div>
      </main>
    </div>
  );
}
