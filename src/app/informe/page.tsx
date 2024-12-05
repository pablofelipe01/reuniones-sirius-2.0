"use client";

import NavBar from "../../../components/NavBar";

export default function InformePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundImage: "url('/h6.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <NavBar />
      <br />
      <br />
      <br />
      {/* Main content container with proper spacing */}
      <div className="flex-1 pt-16 px-4 md:px-8 mt-8">
        <div 
          className="w-full max-w-4xl mx-auto rounded-lg shadow-lg p-6"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.41)" }}
        >
          <h1 className="text-center text-xl md:text-2xl font-bold text-gray-400 mb-6">
            Informe
          </h1>
          
          {/* Iframe container with proper dimensions */}
          <div className="w-full overflow-hidden rounded-lg">
            <iframe
              className="airtable-embed"
              src="https://airtable.com/embed/appWKJI1rfw13k6Wv/shrWi1LvuIWxjLjpV"
              frameBorder="0"
              width="100%"
              height="533"
              style={{
                background: "transparent",
                border: "1px solid #ccc",
              }}
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}