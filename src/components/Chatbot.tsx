import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Phone } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to CityServe Portal! 🏛️ I can help you:\n\n• Submit a new complaint\n• Check complaint status\n• Contact registered departments\n\nHow can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simple bot responses
    setTimeout(() => {
      let botResponse = "";
      const lowerInput = inputValue.toLowerCase();

      if (lowerInput.includes("status") || lowerInput.includes("track")) {
        botResponse = "To check your complaint status, please visit the Track Complaint page or provide your complaint ID. You can also view all your complaints in the My Complaints section.";
      } else if (lowerInput.includes("submit") || lowerInput.includes("new") || lowerInput.includes("complaint")) {
        botResponse = "To submit a new complaint, click on 'Submit Complaint' in the navigation menu. You'll need to provide details about the issue, location, and category.";
      } else if (lowerInput.includes("contact") || lowerInput.includes("phone") || lowerInput.includes("call")) {
        botResponse = "You can reach us at:\n📞 +91 98765 43210\n📧 support@cityserve.in\n\nOur team is available 24/7 to assist you.";
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        botResponse = "Hello! How can I help you with CityServe today?";
      } else {
        botResponse = "I can help you with:\n• Submitting complaints\n• Checking complaint status\n• Contacting departments\n\nPlease let me know what you need assistance with.";
      }

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setInputValue("");
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">CityServe Assistant</h3>
                <p className="text-xs opacity-90">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="p-2 border-t bg-muted/30">
            <div className="flex gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInputValue("How do I submit a complaint?");
                  handleSend();
                }}
              >
                Submit Complaint
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInputValue("Check complaint status");
                  handleSend();
                }}
              >
                Check Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInputValue("Contact number");
                  handleSend();
                }}
              >
                <Phone className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}