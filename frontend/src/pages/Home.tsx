import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wand2,
  Code,
  Zap,
  Globe,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export function Home() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate("/builder", { state: { prompt } });
    }
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: "Lightning Fast",
      description: "Generate complete websites in seconds, not hours",
    },
    {
      icon: <Code className="w-6 h-6 text-green-400" />,
      title: "Modern Code",
      description: "Clean, responsive HTML, CSS, and JavaScript output",
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-400" />,
      title: "Production Ready",
      description: "Deploy-ready websites with best practices built-in",
    },
  ];

  const examples = [
    "A modern portfolio website for a photographer with a dark theme",
    "An e-commerce landing page for handmade jewelry with payment integration",
    "A restaurant website with menu, reservations, and location map",
    "A SaaS landing page with pricing tiers and feature comparisons",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* NavBar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-white text-lg font-bold tracking-wide">
            AuraBridge
          </div>
          <div className="space-x-6 text-gray-300 text-sm">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#examples" className="hover:text-white">
              Examples
            </a>
            <a
              href="https://github.com/vasvigarg/AuraBridge"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <div className="pt-24 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-100 mb-6 leading-tight">
              Build Websites with
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {" "}
                AI Magic
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into stunning, fully-functional websites in
              minutes. Just describe what you want, and our AI will build it for
              you.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              No coding required. No design skills needed. Just pure creativity.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            id="top-form"
            className="space-y-6 mb-16"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50">
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Describe your dream website
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A modern portfolio website for a photographer with a dark theme, gallery sections, and contact form..."
                className="w-full h-40 p-4 bg-gray-900/80 text-gray-100 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-500 text-lg"
              />
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl"
              >
                <Wand2 className="w-5 h-5" />
                Generate Website
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Features Grid */}
          <div id="features" className="grid md:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
              >
                <div className="flex items-center mb-3">
                  {feature.icon}
                  <h3 className="text-gray-100 font-semibold ml-3">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Example Prompts */}
          <div
            id="examples"
            className="bg-gray-800/20 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30"
          >
            <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">
              Need inspiration? Try these examples:
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {examples.map((example, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 cursor-pointer hover:border-blue-500/50 transition-all duration-300 group"
                  onClick={() => setPrompt(example)}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors">
                      "{example}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-sm text-center mt-6">
              Click any example to use it as your prompt
            </p>
          </div>

          {/* Final Call-to-Action */}
          <div className="mt-24 text-center">
            <h3 className="text-3xl font-bold text-gray-100 mb-4">
              Ready to build your site?
            </h3>
            <p className="text-gray-400 mb-6">
              Start by describing your idea. Our AI will take care of the rest.
            </p>
            <button
              onClick={() => {
                document
                  .getElementById("top-form")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium text-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Get Started
            </button>
          </div>

          {/* Footer */}
          <footer className="mt-24 py-10 border-t border-gray-800 text-center text-sm text-gray-500">
            Made with 💙 by Vasvi |{" "}
            <a
              href="https://github.com/vasvigarg/AuraBridge"
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>{" "}
            | All rights reserved © {new Date().getFullYear()}
          </footer>
        </div>
      </div>
    </div>
  );
}
