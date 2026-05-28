import { useState } from "react";
import { Phone, Mail, MessageCircle, Clock, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CustomerCare = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Your message has been sent! We'll respond within 24 hours.");
    setMessage("");
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header
        showLogo
        showMenu
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        backTo="/dashboard"
      />

      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-10">
          <div className="max-w-3xl mx-auto space-y-5">
            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-6">
                <Phone className="w-5 h-5" />
                <span>Customer Care</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                We're here to help! Get in touch with our support team.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Phone Support</span>
                  </div>
                  <a 
                    href="https://wa.me/447402690551" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    +44 7402 690551
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">Mon-Fri, 9AM-6PM EAT</p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Email Support</span>
                  </div>
                  <a 
                    href="mailto:dropshimpent.ecommerce@gmail.com"
                    className="text-sm text-primary hover:underline"
                  >
                    dropshimpent.ecommerce@gmail.com
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span className="font-semibold">WhatsApp</span>
                  </div>
                  <a 
                    href="https://wa.me/447402690551" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    +44 7402 690551
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">Available 24/7</p>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Business Hours</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Monday - Friday</p>
                  <p className="text-xs text-muted-foreground mt-1">9:00 AM - 6:00 PM EAT</p>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-6">
                <MessageCircle className="w-5 h-5" />
                <span>Send Us a Message</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    required
                    className="bg-secondary"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    className="bg-secondary"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    required
                    className="bg-secondary"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="bg-secondary min-h-[120px]"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-6">
                <HelpCircle className="w-5 h-5" />
                <span>Frequently Asked Questions</span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">How long does delivery take?</h4>
                  <p className="text-sm text-muted-foreground">
                    Standard delivery takes 5-7 business days within Kenya and 10-14 days internationally.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                  <p className="text-sm text-muted-foreground">
                    We accept M-Pesa, bank transfers, and major credit/debit cards.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">How do I track my order?</h4>
                  <p className="text-sm text-muted-foreground">
                    You can track your order from the "Your Running Bookings" section in your dashboard.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerCare;
