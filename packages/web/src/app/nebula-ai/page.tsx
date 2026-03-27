/* eslint-disable */
"use client";
import React from "react";
import {
  Rocket,
  Brain,
  Users,
  BarChart3,
  ShieldCheck,
  Target,
  Layers,
  Activity,
  User,
  BarChart2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// --- Components ---

const SectionHeading = ({
  title,
  subtitle,
  align = "center",
}: {
  title: string;
  subtitle: string;
  align?: string;
}) => (
  <div className={`mb-16 ${align === "center" ? "text-center" : "text-left"}`}>
    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
      {title}
    </h2>
    <div
      className={`h-1 w-24 bg-primary rounded-full mb-6 ${align === "center" ? "mx-auto" : ""}`}
    />
    <p className="text-gray-400 max-w-2xl text-lg leading-relaxed mx-auto">
      {subtitle}
    </p>
  </div>
);

const Card = ({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) => (
  <div className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
    <div
      className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
    />

    <div
      className={`mb-6 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300`}
    >
      <Icon size={24} />
    </div>

    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
  </div>
);

const StatCard = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) => (
  <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
    <div className="text-4xl font-bold text-white mb-2 font-mono">{value}</div>
    <div
      className={`text-primary font-medium mb-1 uppercase tracking-wider text-xs`}
    >
      {label}
    </div>
    <div className="text-gray-500 text-xs">{sub}</div>
  </div>
);

function DashboardPreview() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-32 mt-12">
      <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a] ai-glow overflow-hidden">
        <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
            </div>
            <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
            <span className="text-xs font-mono text-neutral-500">
              simulation_id: 8f92-xA
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-medium animate-pulse">
              Live Analysis
            </span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 min-h-[500px]">
          <div className="border-r border-white/5 p-6 flex flex-col gap-6 bg-black/20">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-medium mb-3">
                Scenario
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Supply Chain Disruption: A tier-1 supplier in Southeast Asia has
                halted production due to geopolitical instability. Inventory
                covers 14 days.
              </p>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-medium mb-3">
                Stakeholders
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded border border-white/5 bg-white/[0.02]">
                  <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-white font-medium">
                      Sarah Chen
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      VP Operations
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded border border-white/5 bg-white/[0.02]">
                  <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-white font-medium">
                      Market Analysis
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      AI Projected Impact
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-xs text-neutral-500 mb-2 flex justify-between">
                <span>Stress Level</span>
                <span>High</span>
              </div>
              <Progress
                value={75}
                className="h-1 bg-neutral-800 [&>div]:bg-orange-500"
              />
            </div>
          </div>
          <div className="md:col-span-2 p-8 relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] grid-mask"></div>
            <div className="relative z-10">
              <h3 className="text-xl text-white font-medium tracking-tight mb-6">
                Strategic Response Required
              </h3>
              <div className="space-y-4">
                <label className="block p-4 rounded border border-white/10 bg-neutral-900/80 hover:bg-neutral-900 hover:border-emerald-500/50 transition-all cursor-pointer group backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 w-4 h-4 rounded border border-neutral-600 group-hover:border-emerald-500 flex items-center justify-center transition-colors">
                      <div className="w-2 h-2 rounded-sm bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div>
                      <span className="text-sm text-white font-medium block mb-1">
                        Diversify Supplier Base
                      </span>
                      <span className="text-xs text-neutral-400">
                        Initiate emergency contracts with LATAM suppliers. +15%
                        Cost, -4 Weeks Lead Time.
                      </span>
                    </div>
                  </div>
                </label>
                <label className="block p-4 rounded border border-white/10 bg-neutral-900/80 hover:bg-neutral-900 hover:border-emerald-500/50 transition-all cursor-pointer group backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 w-4 h-4 rounded border border-neutral-600 group-hover:border-emerald-500 flex items-center justify-center transition-colors"></div>
                    <div>
                      <span className="text-sm text-white font-medium block mb-1">
                        Buffer Inventory Drawdown
                      </span>
                      <span className="text-xs text-neutral-400">
                        Utilize existing stock while negotiating. High risk of
                        stockout if crisis extends {">"} 14 days.
                      </span>
                    </div>
                  </div>
                </label>
              </div>
              <div className="mt-10 pt-8 border-t border-white/5">
                <h4 className="text-xs uppercase tracking-widest text-neutral-500 font-medium mb-4">
                  Competency Mapping
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <CompetencyBar
                    label="Risk Mgmt"
                    value={70}
                    color="bg-emerald-500"
                  />
                  <CompetencyBar
                    label="Financial"
                    value={45}
                    color="bg-amber-500"
                  />
                  <CompetencyBar
                    label="Leadership"
                    value={60}
                    color="bg-indigo-500"
                  />
                  <CompetencyBar label="Speed" value={85} color="bg-sky-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompetencyBar({
  label,
  value,
  color = "bg-neutral-600",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div>
      <div className="h-24 w-4 bg-neutral-800 rounded-full mx-auto relative overflow-hidden">
        <div
          className={`absolute bottom-0 left-0 right-0 ${color}`}
          style={{ height: `${value}%` }}
        ></div>
      </div>
      <div className="text-[10px] text-center mt-2 text-neutral-400">
        {label}
      </div>
    </div>
  );
}

// --- Main App ---

export default function SimulationPage() {
  return (
    <div className="dark min-h-screen bg-[#050505] text-white font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      <Header />

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="container mx-auto text-center max-w-5xl">
          <Badge
            variant="outline"
            className={`mb-8 bg-primary/10 border-primary/20 text-primary text-sm font-medium`}
          >
            Coming Soon
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            The Safe Space for <br />
            <span
              className={`text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500`}
            >
              High-Stakes Decisions.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Nebula is a virtual workplace where you learn by doing. Navigate
            realistic, ever-changing simulations populated by complex AI
            colleagues. Fail safely here, so you succeed out there.
          </p>

          <div className="flex justify-center">
            <Button size="lg">Request Demo</Button>
          </div>

          <DashboardPreview />
        </div>
      </section>

      {/* The Core Experience (Pillars) */}
      <section id="simulation" className="relative z-10 py-24 bg-[#080808]">
        <div className="container mx-auto px-6">
          <SectionHeading
            title="Built on Realism"
            subtitle="The platform stands on three pillars designed to bridge the gap between theory and practice."
          />

          <div className="grid md:grid-cols-3 gap-8">
            <Card
              icon={Brain}
              title="Internal Logic"
              description="A responsive world that reacts to your choices. Budgets freeze, deadlines shift, and hidden motives surface based on sophisticated logic models."
            />
            <Card
              icon={Layers}
              title="Deep Gamification"
              description="Earn Nebula Credits, unlock Career Mode, and compete in short drills. Engagement mechanics that make professional development addictive."
            />
            <Card
              icon={Target}
              title="Cinematic UX"
              description="An interface that feels like a high-end sci-fi operating system, minimizing friction so you can focus purely on decision making."
            />
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section
        id="features"
        className="relative z-10 py-24 border-y border-white/5 bg-[#050505]"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <div
                  className={`absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-20`}
                ></div>
                <div className="relative p-8 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="https://i.pravatar.cc/40?u=john-doe-ai" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-white">John Doe (AI)</h4>
                        <span className="text-xs text-red-400">Stressed</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        "I can't authorize that expense without the VP's
                        sign-off. You know the policy."
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5 opacity-60">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="https://i.pravatar.cc/40?u=sarah-ai" />
                      <AvatarFallback>SA</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-white">
                          Sarah Al-Fayed (AI)
                        </h4>
                        <span className="text-xs text-green-400">
                          Cooperative
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        "I've forwarded the Q3 reports. Check your dashboard."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <h2 className="text-4xl font-bold mb-6">
                Your AI Coworkers <br /> Have{" "}
                <span className={`text-primary`}>Hidden Motives</span>.
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                You’ll work with a full cast of AI colleagues, bosses, and
                direct reports. They aren't just chatbots; they have
                personalities, professional goals, and hidden agendas.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Read the room: Decipher partial information.",
                  "Build reputation: Your choices carry over across sessions.",
                  "Use real tools: Email, chat, dashboards, and reports.",
                  "Face pressure: Time speeds up and visual distractions occur.",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <div className={`w-1.5 h-1.5 rounded-full bg-primary`} />
                    {item}
                  </li>
                ))}
              </ul>

              <Button variant="outline">Request Demo</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="relative z-10 py-24 bg-[#080808]">
        <div className="container mx-auto px-6">
          <SectionHeading
            title="Measurable Outcomes"
            subtitle="We don't just guess. Nebula provides granular data on your professional readiness."
          />

          <div className="grid md:grid-cols-4 gap-6">
            <StatCard
              label="Skill Heatmap"
              value="87%"
              sub="Strategic Thinking"
            />
            <StatCard
              label="Role Readiness"
              value="Top 5%"
              sub="Vs. Global Average"
            />
            <StatCard
              label="Simulation Hours"
              value="12.5h"
              sub="Verifiable Experience"
            />
            <StatCard label="Accuracy" value="94%" sub="Decision Quality" />
          </div>

          <div className="mt-12 p-8 rounded-2xl bg-primary text-center">
            <h3 className="text-2xl font-bold mb-4 text-primary-foreground">
              The "What If" Engine
            </h3>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              After each run, access a full replay with checkpoints. See exactly
              where you went wrong, explore alternative decisions, and get blind
              feedback from human experts.
            </p>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <ShieldCheck size={16} className="text-primary-foreground" />{" "}
                Expert Verified
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Activity size={16} className="text-primary-foreground" />{" "}
                Real-time Feedback
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section
        id="audience"
        className="relative z-10 py-24 bg-[#050505] border-t border-white/5"
      >
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div
                className={`w-16 h-16 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center mb-6 text-primary`}
              >
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">For Universities</h3>
              <p className="text-gray-400 text-sm">
                Give students real workplace experience before graduation. Turn
                theory into practice with verifiable hours.
              </p>
            </div>
            <div className="p-8 border-x border-white/5">
              <div
                className={`w-16 h-16 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center mb-6 text-primary`}
              >
                <BarChart3 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">For Employers</h3>
              <p className="text-gray-400 text-sm">
                Screen candidates by behavior, not just CVs. Run realistic
                rotations and identify top talent instantly.
              </p>
            </div>
            <div className="p-8">
              <div
                className={`w-16 h-16 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center mb-6 text-primary`}
              >
                <Rocket size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">For Professionals</h3>
              <p className="text-gray-400 text-sm">
                Upskill, switch roles, and practice high-stakes decisions
                without the real-world risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6 text-center">
          <div
            className={`relative p-12 rounded-3xl overflow-hidden bg-gradient-to-b from-primary/20 to-black border border-primary/30`}
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to enter the simulation?
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of professionals mastering their careers in
                Nebula. Start with a Quick Drill or dive into Career Mode.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="w-full sm:w-auto justify-center">
                  Request a Demo
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto justify-center"
                >
                  Contact Sales
                </Button>
              </div>
            </div>

            {/* Background glow effect */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]`}
            ></div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
