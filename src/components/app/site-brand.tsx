import { useState } from "react";
import { AppLogo } from "@/components/app/app-logo";
import type { HeaderSettings } from "@/lib/queries";

/**
 * Logo + app-navn i toppen. Logoet er public/custom-logo.png; mangler filen,
 * bruges den indbyggede gryde i stedet. Størrelser og placering styres fra
 * Admin → Generelt.
 */
export function SiteBrand({ name, header }: { name: string; header: HeaderSettings }) {
  const [imgFailed, setImgFailed] = useState(false);
  const useImage = header.logoType === "custom" && !imgFailed;

  return (
    <span className="flex items-center" style={{ gap: header.gap }}>
      <span
        className="flex shrink-0 items-center"
        style={{ position: "relative", top: header.logoOffsetY }}
      >
        {useImage ? (
          <img
            src="/custom-logo.png"
            alt=""
            onError={() => setImgFailed(true)}
            style={{ width: header.logoSize, height: header.logoSize, objectFit: "contain" }}
          />
        ) : (
          <AppLogo
            className="text-primary"
            style={{ width: header.logoSize, height: header.logoSize }}
          />
        )}
      </span>
      <span
        className="font-title leading-none"
        style={{ fontSize: header.textSize, position: "relative", top: header.textOffsetY }}
      >
        {name}
      </span>
    </span>
  );
}
