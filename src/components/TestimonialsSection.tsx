"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";

const testimonials = [
  {
    name: "Maria Rodriguez",
    role: "Sunflower Farm Owner",
    image: "https://avatars.githubusercontent.com/u/1234567?v=4",
    content: "SunflowerScan has revolutionized how I monitor my crops. Early disease detection has saved me thousands of dollars and increased my yield by 30%."
  },
  {
    name: "John Peterson",
    role: "Agricultural Consultant",
    image: "https://avatars.githubusercontent.com/u/2345678?v=4",
    content: "The AI accuracy is incredible. I recommend SunflowerScan to all my clients - it's like having a plant pathologist in your pocket 24/7."
  },
  {
    name: "Dr. Sarah Chen",
    role: "Plant Pathologist",
    image: "https://avatars.githubusercontent.com/u/3456789?v=4",
    content: "As a researcher, I'm impressed by the precision of the disease identification. This tool is invaluable for both farmers and agricultural professionals."
  },
  {
    name: "Ahmed Hassan",
    role: "Commercial Farmer",
    image: "https://avatars.githubusercontent.com/u/4567890?v=4",
    content: "Managing 500 acres of sunflowers became much easier with SunflowerScan. The instant analysis helps me make quick decisions and protect my investment."
  },
  {
    name: "Lisa Thompson",
    role: "Organic Farm Manager",
    image: "https://avatars.githubusercontent.com/u/5678901?v=4",
    content: "The detailed disease analysis and treatment recommendations have helped us maintain our organic certification while keeping our crops healthy."
  },
  {
    name: "Roberto Silva",
    role: "Agricultural Extension Officer",
    image: "https://avatars.githubusercontent.com/u/6789012?v=4",
    content: "I use SunflowerScan to help local farmers in my region. The tool's accuracy and ease of use make it perfect for field consultations."
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 overflow-hidden bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-normal mb-4">Trusted by Farmers</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of satisfied farmers using SunflowerScan
          </p>
        </motion.div>

        <div className="relative flex flex-col antialiased">
          <div className="relative flex overflow-hidden py-4">
            <div className="animate-marquee flex min-w-full shrink-0 items-stretch gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={`${index}-1`} className="w-[400px] shrink-0 bg-card/40 backdrop-blur-xl border-border hover:border-border/50 transition-all duration-300 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {testimonial.content}
                  </p>
                </Card>
              ))}
            </div>
            <div className="animate-marquee flex min-w-full shrink-0 items-stretch gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={`${index}-2`} className="w-[400px] shrink-0 bg-card/40 backdrop-blur-xl border-border hover:border-border/50 transition-all duration-300 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {testimonial.content}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;