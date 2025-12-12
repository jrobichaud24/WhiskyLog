
async function testWhiskyEdition() {
    const API_BASE = "https://thewhiskyedition.com/api";
    const queries = ["Lagavulin 16", "Glenfiddich 12", "Laphroaig 10", "Macallan 12"];

    for (const query of queries) {
        console.log(`\nTesting '${query}'...`);
        const searchUrl = `${API_BASE}/whisky/get?search=${encodeURIComponent(query)}`;

        try {
            const res = await fetch(searchUrl);
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    const item = data[0];
                    console.log(`  Name: ${item.name}`);
                    console.log(`  Foto URL: ${item.foto_url}`);
                    console.log(`  Image URL: ${item.image_url}`);
                } else {
                    console.log("  No results.");
                }
            }
        } catch (e) { console.error(e); }
    }
}

testWhiskyEdition();
