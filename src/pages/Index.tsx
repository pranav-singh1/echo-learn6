
import React, { useState } from 'react';
import Hero from '../components/Hero';
import ChatInterface from '../components/ChatInterface';
import Sidebar from '../components/Sidebar';
import QuizPanel from '../components/QuizPanel';
import FloatingMic from '../components/FloatingMic';
import Footer from '../components/Footer';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {!chatStarted ? (
            <Hero onStartSpeaking={() => setChatStarted(true)} />
          ) : (
            <ChatInterface onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          )}
        </div>

        {/* Quiz Panel */}
        <QuizPanel 
          isOpen={quizOpen} 
          onClose={() => setQuizOpen(false)} 
        />
      </div>

      {/* Floating Microphone */}
      {chatStarted && (
        <FloatingMic 
          onQuizToggle={() => setQuizOpen(!quizOpen)} 
        />
      )}

      <Footer />
    </div>
  );
};

export default Index;
