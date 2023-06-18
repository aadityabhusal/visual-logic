export async function visitCount() {
  const url = import.meta.env.VITE_APP_VISIT_COUNT_URL;
  const headers = {
    "Content-Type": "application/json",
    "X-Access-Key": import.meta.env.VITE_APP_VISIT_COUNT_KEY,
  };
  let data = await (await fetch(url, { headers })).json();
  console.log(data?.record?.visits);
  await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify({ visits: Number(data?.record?.visits) + 1 }),
  });
}
