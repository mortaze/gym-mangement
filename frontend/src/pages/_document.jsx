import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Charm:wght@400;700&family=Jost:wght@300;400;500;600;700&family=Oregano&family=Roboto:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem("gym-theme");
                  if (theme === "light" || theme === "dark") {
                    document.documentElement.className = theme;
                    return;
                  }
                } catch(e) {}
                if (window.matchMedia("(prefers-color-scheme: light)").matches) {
                  document.documentElement.className = "light";
                } else {
                  document.documentElement.className = "dark";
                }
              })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
