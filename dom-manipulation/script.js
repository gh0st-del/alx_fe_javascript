let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Get busy living or get busy dying.", category: "Inspiration" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", category: "Self" }
];

const API_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchQuotesFromServer()
{
  try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      const serverQuotes = data.slice(0, 5).map(item => (
          {
          text: item.title,
          category: "General"
      }));

      syncQuotes(serverQuotes);
  }
  catch (error)
  {
      console.error("Error fetching server quotes:", error);
  }
}

function syncQuotes(serverQuotes)
{
  const newQuotes = [...quotes];
  serverQuotes.forEach(serverQuote =>
  {
      const existingQuote = newQuotes.find(quote => quote.text === serverQuote.text);
      if (!existingQuote)
      {
          newQuotes.push(serverQuote);
      }
  });

  quotes = newQuotes;
  saveQuotes();
  showRandomQuotes();
  alert("Quotes synced with server!");
}

async function postQuoteToServer(newQuote)
{
  try
  {
      const response = await fetch(API_URL,
      {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              title: newQuote.text,
              body: newQuote.text,
              userId: 1              
          })
      });

      if (response.ok)
      {
          const serverResponse = await response.json();
          console.log("Posted new quote to the server:", serverResponse);
          alert("Quote added to the server successfully!");
      }
      else
      {
          console.error("Error posting quote to the server:", response.status);
          alert("Failed to post the quote to the server");
      }
  }
  catch (error)
  {
      console.error("Error posting quote:", error);
      alert("An error occurred while posting the quote.");
  }
}

function showRandomQuotes(filteredQuotes = quotes)
{
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filteredQuotes.length > 0) {
      const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
      quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
  } else {
      quoteDisplay.textContent = "No quotes available in this category.";
  }
}

function populateCategories()
{
  const categoryFilter = document.getElementById("categoryFilter");

  const categories = ["all", ...new Set(quotes.map(quote => quote.category))];

  categoryFilter.innerHTML = "<option value='all'>All Categories</option>";

  categories.forEach(category =>
  {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
  });

  const lastSelectedCategory = localStorage.getItem("lastCategoryFilter");
  if (lastSelectedCategory)
  {
      categoryFilter.value = lastSelectedCategory;
  }
}

function filterQuotes()
{
  const selectedCategory = document.getElementById("categoryFilter").value;

  const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(quote => quote.category === selectedCategory);

  showRandomQuotes(filteredQuotes);

  localStorage.setItem("lastCategoryFilter", selectedCategory);
}

function addQuote()
{
  const newQuoteText = document.getElementById("newQuoteText").value;
  const newQuoteCategory = document.getElementById("newQuoteCategory").value;

  if (newQuoteText && newQuoteCategory)
  {
      const newQuote = {
          text: newQuoteText,
          category: newQuoteCategory
      };

      quotes.push(newQuote);

      localStorage.setItem("quotes", JSON.stringify(quotes));

      document.getElementById("newQuoteText").value = "";
      document.getElementById("newQuoteCategory").value = "";

      showRandomQuotes();
  }
  else
  {
      alert("Please fill out both the quote text and category.");
  }
}

function createAddQuoteForm()
{
  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteForm";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";
  
  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.innerHTML = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

function exportToJson()
{
  const jsonQuotes = JSON.stringify(quotes, null, 2);

  const blob = new Blob([jsonQuotes], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quotes.json";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

function importFromJsonFile(event)
{
  const fileReader = new FileReader();
  
  fileReader.onload = function(event)
  {
      try
      {
          const importedQuotes = JSON.parse(event.target.result);

          if (Array.isArray(importedQuotes))
          {
              quotes.push(...importedQuotes);

              saveQuotes();

              alert("Quotes imported successfully!");
          }
          else
          {
              alert("Invalid JSON format. The file must contain an array of quotes.");
          }
      }
      catch (error)
      {
          alert("Error parsing the JSON file. Please make sure it contains valid JSON.");
      }
  };

  fileReader.readAsText(event.target.files[0]);
}

function saveQuotes()
{
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

document.addEventListener("DOMContentLoaded", function()
{
  populateCategories();

  showRandomQuotes();

  createAddQuoteForm();

  const lastViewedQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastViewedQuote) {
      console.log("Last viewed quote:", JSON.parse(lastViewedQuote));
  }
});

setInterval(fetchQuotesFromServer, 5000);