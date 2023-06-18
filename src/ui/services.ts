export async function visitCount() {
  const url = import.meta.env.VITE_APP_VISIT_COUNT_URL;
  const headers = {
    "Content-Type": "application/json",
    "X-Access-Key": import.meta.env.VITE_APP_VISIT_COUNT_KEY,
  };

  let data = await (await fetch(url, { headers })).json();
  const urlParam = new URLSearchParams(window.location.search);
  let ref = urlParam.get("ref") || "direct";

  await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify({ [ref]: Number(data?.record?.visits) + 1 }),
  });
}
