import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Suspense } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { THEME_INIT_SCRIPT } from "@/components/theme-toggle";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Onani: Watch films and series",
    template: "%s · Onani",
  },
  description: "Onani by PentaTech. Stream films and series on your phone, laptop or TV. Plans from K25 a week, paid with mobile money.",
  openGraph: { siteName: "Onani", type: "website" },
  appleWebApp: { title: "Onani", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `if(location.search.includes('debughydration')){var L=[];var d=function(n){return n.nodeType===1?(n.tagName+'.'+String(n.className).slice(0,50)+' id='+(n.id||'')+' :: '+(n.textContent||'').trim().slice(0,50)):(n.nodeType===8?'<!--'+n.data+'-->':'#text '+(n.textContent||'').trim().slice(0,30))};new MutationObserver(function(ms){ms.forEach(function(m){m.removedNodes.forEach(function(n){L.push({t:performance.now()|0,op:'rm',p:m.target.nodeName+(m.target.id?'#'+m.target.id:''),n:d(n)})});m.addedNodes.forEach(function(n){if(n.nodeType===1)L.push({t:performance.now()|0,op:'add',p:m.target.nodeName+(m.target.id?'#'+m.target.id:''),n:d(n)})})})}).observe(document.documentElement,{childList:true,subtree:true});var E=null;window.addEventListener('error',function(e){if(String(e.message).indexOf('418')>-1&&!E)E=performance.now()|0});setTimeout(function(){window.__hydrationReport={errorAt:E,around:E?L.filter(function(x){return x.t>=E-5&&x.t<=E+400}).slice(0,40):L.filter(function(x){return x.op==='rm'}).slice(0,20)}},8000)}`,
          }}
        />
      </head>
      <body className="pb-tabbar flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-ink px-4 py-2 font-bold text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {/* Fixed to the bottom of the screen; kept early in the document so its
            streamed boundary resolves with the header's instead of after the footer. */}
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
        <SiteHeader />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
