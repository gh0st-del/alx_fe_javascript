const quotes = JSON.parse(localStorage.getItem("quotes")) || [
    {
      text: "The only way to do great work is to love what you do.",
      category: "Motivation",
    },
    {
      text: "Life is what happens when you're busy making other plans.",
      category: "Life",
    },
    {
      text: "Do what you can, with what you have, where you are.",
      category: "Inspiration",
    },
  ];
  
  function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }
  
  function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    const categories = [...new Set(quotes.map((quote) => quote.category))];
  
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }
  
  function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    localStorage.setItem("lastSelectedCategory", selectedCategory);
  
    const filteredQuotes =
      selectedCategory === "all"
        ? quotes
        : quotes.filter((quote) => quote.category === selectedCategory);
  
    displayQuotes(filteredQuotes);
  }
  
  function displayQuotes(quotesToDisplay) {
    const quoteDisplay = document.getElementById("quoteDisplay");
    if (quotesToDisplay.length === 0) {
      quoteDisplay.innerHTML = "<p>No quotes available in this category.</p>";
    } else {
      quoteDisplay.innerHTML = quotesToDisplay
        .map(
          (quote) => `<p>"${quote.text}" - <strong>${quote.category}</strong></p>`
        )
        .join("");
    }
  }
  
  function showRandomQuote() {
    const quoteDisplay = document.getElementById("quoteDisplay");
    if (quotes.length === 0) {
      quoteDisplay.innerHTML = "<p>No quotes available. Add some!</p>";
      return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    quoteDisplay.innerHTML = `<p>"${quote.text}" - <strong>${quote.category}</strong></p>`;
    sessionStorage.setItem("lastQuote", JSON.stringify(quote));
  }
  
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportQuotes").addEventListener("click", exportToJson);
  document
    .getElementById("importFile")
    .addEventListener("change", importFromJsonFile);
  document
    .getElementById("categoryFilter")
    .addEventListener("change", filterQuotes);
  
  function addQuote() {
    const quoteText = document.getElementById("newQuoteText").value.trim();
    const quoteCategory = document
      .getElementById("newQuoteCategory")
      .value.trim();
  
    if (quoteText === "" || quoteCategory === "") {
      alert("Please enter both a quote and a category.");
      return;
    }
  
    quotes.push({ text: quoteText, category: quoteCategory });
    saveQuotes();
    populateCategories();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
  }
  
  function exportToJson() {
    const data = new Blob([JSON.stringify(quotes, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(data);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", "quotes.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  }
  
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      try {
        const importedQuotes = JSON.parse(event.target.result);
        if (Array.isArray(importedQuotes)) {
          quotes.push(...importedQuotes);
          saveQuotes();
          populateCategories();
          alert("Quotes imported successfully!");
        } else {
          alert("Invalid JSON format. Please upload a valid quotes file.");
        }
      } catch (error) {
        alert("Error parsing JSON file.");
      }
    };
    fileReader.readAsText(event.target.files[0]);
  }
  
  function restoreFilter() {
    const lastCategory = localStorage.getItem("lastSelectedCategory") || "all";
    document.getElementById("categoryFilter").value = lastCategory;
    filterQuotes();
  }
  
  populateCategories();
  restoreFilter();
  
  const serverUrl = "https://jsonplaceholder.typicode.com/posts";
  
  async function fetchQuotesFromServer() {
    try {
      const response = await fetch(serverUrl);
      const data = await response.json();
      const serverQuotes = data.map((post) => ({
        text: post.body,
        category: post.title,
      }));
      await syncQuotesWithServer(serverQuotes);
    } catch (error) {
      console.error("Error fetching server data:", error);
    }
  }
  
  setInterval(fetchQuotesFromServer, 10000);
  
  async function syncQuotesWithServer(serverQuotes) {
    const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
  
    const mergedQuotes = [...serverQuotes, ...localQuotes];
    localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
    populateCategories();
    alert("Quotes synced with server!");
  }
  
  async function postQuoteToServer(quote) {
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quote),
    });
  
    if (response.ok) {
      const data = await response.json();
      console.log("Quote posted to server:", data);
    } else {
      console.error("Failed to post quote to server");
    }
  }
  
  async function addQuote() {
    const quoteText = document.getElementById("newQuoteText").value.trim();
    const quoteCategory = document
      .getElementById("newQuoteCategory")
      .value.trim();
  
    if (quoteText === "" || quoteCategory === "") {
      alert("Please enter both a quote and a category.");
      return;
    }
  
    const newQuote = { text: quoteText, category: quoteCategory };
    quotes.push(newQuote);
  
    await postQuoteToServer(newQuote);
  
    saveQuotes();
    populateCategories();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added and posted to server!");
  }
  
  function resolveConflict(localQuote, serverQuote) {
    return serverQuote;
  }