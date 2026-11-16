import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus, Sparkle } from "lucide-react";
import { Footer } from "@/components/home/Footer";
import { CountingNumber } from "@/components/ui/counting-number";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ISHTILE+ — More than a brand" },
      { name: "description", content: "More than a brand. A cultural destination. Discover the story and vision behind ISHTILE+." },
      { property: "og:title", content: "About ISHTILE+ — More than a brand" },
      { property: "og:description", content: "More than a brand. A cultural destination." },
    ],
  }),
  component: AboutPage,
});

function BrandArtwork() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative mx-auto aspect-[4/5] w-full max-w-[500px] overflow-hidden">
      <div className="absolute -right-[22%] top-[3%] h-[72%] w-[82%] rounded-[48%] bg-[#d6ed27] rotate-[-24deg]" />
      <div className="absolute right-[-15%] top-[13%] h-[66%] w-[72%] rounded-[48%] border-[26px] border-[#171717] bg-[#31b8d1] rotate-[-24deg]" />
      <div className="absolute right-[-7%] top-[21%] h-[57%] w-[62%] rounded-[48%] border-[18px] border-[#f4b42a] bg-[#f07a32] rotate-[-24deg]" />
      <div className="absolute right-[1%] top-[31%] h-[43%] w-[51%] rounded-[48%] border-[17px] border-[#171717] bg-[#235c78] rotate-[-24deg]" />
      <svg viewBox="0 0 520 620" className="absolute inset-0 h-full w-full" fill="none">
        <g stroke="#171717" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M-8 440 C65 350 110 245 183 164 C223 120 269 107 310 128 C249 145 222 193 204 251 C186 310 140 382 66 449 Z" fill="#f1e9d7"/>
          <path d="M18 480 C80 379 132 279 212 205 C250 170 291 158 331 174 C277 190 246 235 222 292 C195 356 135 431 78 491 Z" fill="#f1e9d7"/>
          <path d="M60 515 C121 424 178 333 255 270 C297 236 341 228 377 246 C320 256 285 299 253 348 C214 408 154 481 112 528 Z" fill="#f1e9d7"/>
          <path d="M112 542 C169 466 227 398 298 351 C342 322 384 318 417 338 C363 344 324 379 285 423 C242 472 191 521 160 553 Z" fill="#f1e9d7"/>
          <path d="M-20 424 C48 392 107 360 165 308" />
          <path d="M18 472 C89 432 146 394 205 347" />
          <path d="M62 510 C127 476 189 431 246 390" />
          <path d="M112 540 C179 510 235 469 293 433" />
          <path d="M156 559 C225 542 281 509 332 475" />
          <path d="M194 574 C268 568 325 539 371 504" />
        </g>
        <g fill="#f7f0e2" stroke="#171717" strokeWidth="2.2">
          <path d="M270 18 C309 69 315 117 286 158 C250 121 246 75 270 18Z"/>
          <path d="M290 157 C333 111 377 105 418 132 C384 171 338 181 290 157Z"/>
          <path d="M286 159 C337 166 365 202 363 248 C316 236 287 205 286 159Z"/>
          <path d="M284 160 C244 196 235 240 254 280 C293 242 306 201 284 160Z"/>
          <path d="M280 157 C235 150 201 171 184 210 C233 220 270 202 280 157Z"/>
        </g>
        <path d="M282 160 L282 270" stroke="#171717" strokeWidth="2.4"/>
        <path d="M282 161 C300 125 313 87 310 45" stroke="#171717" strokeWidth="2.2"/>
        <path d="M282 161 C324 151 357 145 396 151" stroke="#171717" strokeWidth="2.2"/>
      </svg>
      <Sparkle className="absolute left-[8%] top-[16%] h-7 w-7 text-[#171717]" strokeWidth={1.4}/>
      <Plus className="absolute bottom-[16%] right-[8%] h-7 w-7 text-[#f7f0e2]" strokeWidth={1.2}/>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f1eadb] text-[#171717]">
      <main className="mx-auto max-w-[1600px] px-5 pb-0 pt-8 md:px-10 md:pb-0 md:pt-12">
        <section className="relative min-h-[660px] md:min-h-[min(700px,calc(100svh-5rem))]">
          <div className="relative z-10 w-[66%] max-w-[620px] pb-4 pt-7 md:w-[48%] md:pb-20 md:pt-0">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6e675c] md:text-xs">Our story · ISHTILE+</p>
            <h1 className="max-w-[540px] font-display text-[clamp(3.1rem,11vw,7.8rem)] font-extrabold leading-[0.83] tracking-[-0.075em]">
              About<br/>ISHTILE<span className="text-[#171717]">.</span>
            </h1>
            <p className="mt-6 max-w-[330px] text-base font-medium leading-snug md:mt-8 md:text-xl">
              More than a brand.<br/>A cultural destination.
            </p>
            <p className="mt-7 max-w-[390px] text-[13px] leading-[1.65] text-[#39352f] md:mt-10 md:text-base">
              ISHTILE is a celebration of fashion, culture and everything in between. From timeless traditions to contemporary trends, we bring you a curated universe of style.
            </p>
            <Link to="/editorial" className="mt-5 inline-flex items-center gap-2 border-b border-[#171717] pb-1 text-xs font-semibold transition-all hover:gap-3 md:mt-7 md:text-sm">
              Our Vision <ArrowUpRight className="h-4 w-4"/>
            </Link>
          </div>

          <div className="pointer-events-none absolute right-[-23%] top-[2%] z-0 w-[82%] md:inset-y-0 md:right-[-4%] md:top-0 md:w-[62%]">
            <BrandArtwork />
          </div>

          <div className="absolute bottom-0 left-0 z-20 grid w-full grid-cols-3 overflow-hidden rounded-xl bg-[#171717] text-[#f4eddf] shadow-[0_16px_38px_rgba(0,0,0,0.2)] md:w-[min(650px,58%)]">
            {[
              { target: 5, suffix: "+", label: "Brands" },
              { target: 50, suffix: "K+", label: "Customers" },
              { target: 12, suffix: "+", label: "Stores" },
            ].map((stat, index) => (
              <div key={stat.label} className={`flex min-h-[76px] flex-col justify-center px-3 py-3 text-center md:min-h-[104px] md:px-6 ${index ? "border-l border-white/15" : ""}`}>
                <strong className="font-display text-[1.55rem] font-bold leading-none tracking-[-0.04em] md:text-3xl">
                  <CountingNumber target={stat.target} />
                  {stat.suffix}
                </strong>
                <span className="mt-2 text-[9px] tracking-wide text-[#d4cbbb] md:text-xs">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
