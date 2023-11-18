//working with http request from the client side

const loadCommentsBtnElement = document.getElementById("load-comments-btn");
const commentsSectionElement = document.getElementById("comments");
const commentsFormElement = document.querySelector("#comments-form form");
const commentTitleElement = document.getElementById("title");
const commentTextElement = document.getElementById("text");

//working with the comment section

function createCommentsList(comments) {
  const commentListElement = document.createElement("ol");

  for (const comment of comments) {
    const commentElement = document.createElement("li");
    commentElement.innerHTML = `
        <article class="comment-item">
            <h2>${comment.title}</h2>
            <p>${comment.text}</p>
        </article>
    `;

    commentListElement.appendChild(commentElement);
  }

  return commentListElement;
}

//function that fetch comments to the defines route within fetch()
async function fetchCommentsForPost() {
  const postId = loadCommentsBtnElement.dataset.postid;
  const response = await fetch(`/posts/${postId}/comments`); //the get request route

  const responseData = await response.json(); // fetching the response data

  if (responseData && responseData.length > 0) {
    const commentsListElement = createCommentsList(responseData);
    commentsSectionElement.innerHTML = ``;

    commentsSectionElement.appendChild(commentsListElement);
  } else {
    commentsSectionElement.firstElementChild.textContent =
      "There are no comments yet";
  }
}

//function for submitting a comment

async function saveComment(event) {
  event.preventDefault();
  const postId = commentsFormElement.dataset.postid;

  const enteredTitle = commentTitleElement.value;
  const enteredText = commentTextElement.value;

  const comment = { title: enteredTitle, text: enteredText };

  //sending http request

  const response = await fetch(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(comment),
    headers: {
      "Content-Type": "application/json",
    },
  });

  fetchCommentsForPost();
}

loadCommentsBtnElement.addEventListener("click", fetchCommentsForPost);
//working with the form element where we enter the comments
commentsFormElement.addEventListener("submit", saveComment);
