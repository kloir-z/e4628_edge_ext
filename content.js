document.querySelectorAll("td[onmousemove]").forEach((td) => {
  const htmlString = td.getAttribute("onmousemove");
  const match = htmlString.match(/showPopup\(event,'(.*)'\);/);
  if (match && match[1]) {
    const decoded = match[1]
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&");

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = decoded;

    const secondRow = tempDiv.querySelectorAll("tr")[1];
    const secondTd = secondRow ? secondRow.querySelector("td") : null;
    const finalText = secondTd ? secondTd.textContent.trim() : "";

    td.textContent = finalText;
    td.style.whiteSpace = "nowrap";
    td.style.overflow = "visible";
    td.style.textOverflow = "unset";
  }
});

document.querySelectorAll("img").forEach((img) => {
  img.style.height = "10px";
});
