async function run() {
  const res = await fetch('http://localhost:3000/shop?category=handbags');
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Length:", text.length);
  if (text.includes('No products match your filters')) {
    console.log("Found: No products match");
  } else if (text.includes('Tote bag')) {
    console.log("Found: Products!");
  } else {
    console.log("Found neither!");
    console.log(text.substring(0, 500));
  }
}
run();
