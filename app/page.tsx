
import WaitlistForm from "@/app/waitlist-form";
import Logo from "./components/Logo";

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-purple-100/30" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,_rgba(59,130,246,0.12)_0%,_transparent_30%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_75%_75%,_rgba(147,51,234,0.12)_0%,_transparent_35%)]" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[100dvh] px-6 py-8 sm:px-10">
        <main className="w-full max-w-6xl grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div className="order-2 md:order-1 text-center md:text-left flex flex-col gap-5 md:gap-6">
            <Logo size={80} withWordmark animated className="md:items-start" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight tracking-tight">
              Welcome to Align
            </h1>
            <h2 className="text-lg sm:text-xl font-medium text-gray-600 max-w-xl">
              Clarity, Calm, and Mediation for Difficult Conversations
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-xl">
              Conflicts with your partner, family, friends, or colleagues can leave you frustrated, stuck, or unsure how to respond. <span className="font-semibold text-blue-600">Align</span> helps you think clearly, communicate effectively and neutrally mediate the conversations you choose.
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-xl">
              It&apos;s like having a lawyer for your perspective: vent safely, organise thoughts without the heat of emotions, and present your side rationally.
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-xl">
              A safe, confidential space to release frustration, gain clarity, and let a neutral AI mediate with balance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="#waitlist"
                className="group relative inline-flex items-center justify-center px-7 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span className="relative z-10">Join the Waitlist</span>
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href="#learn-more"
                className="inline-flex items-center justify-center px-7 py-3 text-base font-medium text-gray-700 bg-white/80 backdrop-blur-sm rounded-full shadow border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2 flex flex-col items-center md:items-stretch justify-center gap-6">
            <div className="w-full max-w-md md:max-w-none bg-white/70 backdrop-blur-sm border border-white/40 shadow-xl rounded-2xl p-6 md:p-7 flex flex-col gap-5">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-blue-600 uppercase">Early Access</h3>
                <p className="text-xl font-semibold text-gray-900 mt-1">Be the first to try Align</p>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Join the waitlist and get early access when we roll out private testing. We&apos;ll only email you about Align.
                </p>
              </div>
              <WaitlistForm />
              <ul className="text-sm text-gray-600 space-y-1 pt-1">
                <li>• Private & confidential</li>
                <li>• Human + AI centered approach</li>
                <li>• Designed for clarity & fairness</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
