/* eslint-disable @next/next/no-img-element */

export default function ProviderLogo({
  provider,
}: {
  provider: "github.com" | "gitlab.com" | undefined;
}) {
  if(provider === "gitlab.com") {
    return <img className="w-12 h-12" src="/gitlab.svg" alt="gitlab's logo" />;
  }
  return <img className="w-8 h-8 mx-2" src="/github.svg" alt="github's logo" />;
}
