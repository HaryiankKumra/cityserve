import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(
    [
      {
        id: "1",
        text: "Hello! I'm CityServe Assistant. How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateResponse(input.toLowerCase());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (query: string): string => {
    if (query.includes("track") || query.includes("complaint")) {
      return "To track your complaint, visit the Track page and enter your complaint ID. You can also view all your complaints in 'My Complaints'.";
    }
    if (query.includes("submit") || query.includes("file") || query.includes("report")) {
      return "To submit a complaint, click 'Submit Complaint' on the homepage. You'll need to provide details, location, and optionally upload photos.";
    }
    if (query.includes("status") || query.includes("progress")) {
      return "Check complaint status in 'My Complaints'. Statuses include: New, In Progress, Resolved, and Closed with real-time updates.";
    }
    if (query.includes("department")) {
      return "Complaints are automatically assigned to relevant departments. View all departments and their work on the Departments page.";
    }
    if (query.includes("help") || query.includes("support")) {
      return "I can help with: filing complaints, tracking complaints, understanding status, department info, and platform guidance. What would you like to know?";
    }
    if (query.includes("login") || query.includes("account")) {
      return "To access all features, sign in or create an account. Click 'Sign In' in the navigation menu.";
    }
    if (query.includes("priority") || query.includes("urgent")) {
      return "Priority is determined by admins based on severity. Critical issues like safety hazards are prioritized.";
    }
    if (query.includes("photo") || query.includes("image")) {
      return "Upload photos when submitting complaints for visual evidence. Supported: JPG, PNG. Max: 5MB per image.";
    }
    if (query.includes("location") || query.includes("address")) {
      return "Select location on the map or enter address manually when filing. Accurate location helps faster response.";
    }
    return "I'm here to help! Ask about filing complaints, tracking them, department info, or platform features.";
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] sm:h-[600px] shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base">
                CityServe Assistant
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef}>
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-xs sm:text-sm break-words">
                      {message.text}
                    </p>
                    <span className="text-[10px] opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Typing...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 text-sm"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                size="icon"
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}