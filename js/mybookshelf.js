const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function generateBookObject(title, author, year, isCompleted) {
  return {
    id: +new Date(),
    title,
    author,
    year,
    isCompleted,
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  const searchButton = document.getElementById("searchSubmit");

  // submit form input
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  // search button
  searchButton.addEventListener("click", function (event) {
    event.preventDefault();
    searchBooks();
  });

  // menutup tab edit
  const closeForm = document.getElementById("closeForm");
  closeForm.addEventListener("click", function (event) {
    event.preventDefault();
    const edit = document.querySelector(".div-edit");
    edit.setAttribute("hidden", "");
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// mencari data buku sesuai Id
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id == bookId) {
      return bookItem;
    }
  }
  return null;
}

// mencari index buku dari local storage
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

// membuat data buku
function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const bookCompleted = document.getElementById("completed").checked;

  const bookObject = generateBookObject(bookTitle, bookAuthor, bookYear, bookCompleted);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// input buku
function inputBook(bookObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("item");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");

    editButton.addEventListener("click", function () {
      editBook(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      if (confirm("Apa anda yakin ingin menghapus buku?")) {
        removeBookFromCompleted(bookObject.id);
      } else {
        return;
      }
    });

    container.append(undoButton, editButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    checkButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");

    editButton.addEventListener("click", function () {
      editBook(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button2");

    trashButton.addEventListener("click", function () {
      if (confirm("Apa anda yakin ingin menghapus buku?")) {
        removeBookFromCompleted(bookObject.id);
      } else {
        return;
      }
    });

    container.append(checkButton, editButton, trashButton);
  }

  return container;
}

// menambah buku ke rak selesai dibaca

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// menghapus buku dari rak selesai dibaca
function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// memindahkan buku ke rak belum selesai dibaca
function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// menampilkan tab edit dan data buku

function editBook(bookId) {
  const edit = document.querySelector(".div-edit");
  edit.removeAttribute("hidden");

  const bookTarget = findBook(bookId);

  //menampilkan data buku di form edit
  const editBookTitle = document.getElementById("editBookTitle");
  editBookTitle.value = bookTarget.title;
  const editBookAuthor = document.getElementById("editBookAuthor");
  editBookAuthor.value = bookTarget.author;
  const editYear = document.getElementById("editBookYear");
  editYear.value = bookTarget.year;
  const editBookCompleted = document.getElementById("editCompleted");
  editBookCompleted.checked = bookTarget.isCompleted;

  const submitEdit = document.getElementById("edit-submit");
  submitEdit.addEventListener("click", function (event) {
    // memasukan data baru pada buku yang diedit
    updateEditBook(editBookTitle.value, editBookAuthor.value, editYear.value, editBookCompleted.checked, bookId);
    // menutup tab edit ketika selesai edit buku
    const edit = document.querySelector(".div-edit");
    edit.setAttribute("hidden", "");
    event.preventDefault();
  });
}
// update data buku di local storage
function updateEditBook(title, author, year, completed, id) {
  // mengambil data pada local storage dan dikonversi dari String menjadi Objek
  const StorageBook = JSON.parse(localStorage[STORAGE_KEY]);
  const bookIndex = findBookIndex(id);
  console.log(StorageBook);
  console.log(bookIndex);
  // membentuk data baru pada buku
  StorageBook[bookIndex] = {
    id: id,
    title: title,
    author: author,
    year: year,
    isCompleted: completed,
  };
  // konversi data menjadi String
  const parsed = JSON.stringify(StorageBook);
  localStorage.setItem(STORAGE_KEY, parsed);
  // memuat halaman setelah data diubah
  location.reload(true);
}

// menampilkan data yang disimpan dalam local storage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// mencari buku
function searchBooks() {
  const titleBook = document.getElementById("searchBookTitle").value.toLowerCase();
  const bookList = document.querySelectorAll(".inner");
  for (render of bookList) {
    if (render.innerText.toLowerCase().includes(titleBook) === false) {
      render.parentElement.remove();
    }
  }
}

/**function searchBooks() {
  const titleBook = document.getElementById("searchBookTitle").value.toLowerCase();
  const bookList = document.querySelectorAll(".inner");
  for (render of bookList) {
    if (render.innerText.toLowerCase().includes(titleBook) === false) {
      render.parentElement.style.display = "none";
    } else {
      render.parentElement.style.display = "block";
    }
  }
}**/

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById("uncompletedBooks");
  uncompletedBOOKList.innerHTML = "";

  const completedBOOKList = document.getElementById("completedBooks");
  completedBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = inputBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBOOKList.append(bookElement);
    } else {
      completedBOOKList.append(bookElement);
    }
  }
});
