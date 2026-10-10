/**
 * Komprimér et billede klientside med Canvas API inden upload til Supabase.
 *
 * Anbefalede indstillinger:
 *   maxSide: 1200  — giver fine kortbilleder uden unødig filstørrelse
 *   quality: 0.82  — god balance mellem skarphed og JPEG-komprimering
 *
 * PNG-filer eksporteres som PNG (tabsfrit), så en eventuel gennemsigtig baggrund
 * bevares. Alt andet eksporteres som JPEG. Bemærk: hvis vi eksporterede en
 * gennemsigtig PNG som JPEG, ville de gennemsigtige områder blive SORTE — det er
 * årsagen til at egne PNG-uploads tidligere fik sort baggrund.
 *
 * Returnerer en File hvor `type` er enten "image/png" eller "image/jpeg", og
 * filnavnets extension matcher. Kalderen bør bruge `result.type` som contentType
 * ved upload og aflede extension derfra.
 */
export async function compressImage(
  file: File,
  maxSide = 1200,
  quality = 0.82,
): Promise<File> {
  const isPng = file.type === "image/png" || /\.png$/i.test(file.name);

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Skalér ned hvis billedet er større end maxSide på nogen akse.
      let { width, height } = img;
      if (width > maxSide || height > maxSide) {
        if (width >= height) {
          height = Math.round((height / width) * maxSide);
          width = maxSide;
        } else {
          width = Math.round((width / height) * maxSide);
          height = maxSide;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context ikke tilgængeligt"));
        return;
      }
      // Canvas er gennemsigtigt som udgangspunkt; drawImage bevarer alfa-kanalen.
      ctx.drawImage(img, 0, 0, width, height);

      const outType = isPng ? "image/png" : "image/jpeg";
      const outExt = isPng ? "png" : "jpg";

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Komprimering fejlede"));
            return;
          }
          // Behold det originale filnavn men sæt korrekt extension.
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          resolve(new File([blob], `${baseName}.${outExt}`, { type: outType }));
        },
        outType,
        // PNG er tabsfrit — quality ignoreres. JPEG bruger quality.
        isPng ? undefined : quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Kunne ikke læse billedfilen"));
    };

    img.src = url;
  });
}

