const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const li = document.querySelector(".video__comment");
const text = document.querySelector(".commentText");
const commentOptions = document.querySelectorAll(".commentOption");
const deleteBtn = document.querySelectorAll(".deleteBtn");
const editBtn = document.querySelectorAll(".editBtn");

const saveEditBtn = document.querySelectorAll(".saveEditBtn");
const cancelEditBtn = document.querySelectorAll(".cancelEditBtn");
const editCommentArea = document.querySelector(".editCommentArea");
const editCommentForms = document.querySelectorAll(".editCommentForm");

const likeCommentBtn = document.querySelectorAll(".likeCommentBtn");

const HIDDEN_CLASSNAME = "hidden";

let commentOption;
const addComment = async (text, id) => {
  const response = await fetch(`/api/users/${id}/info`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { comment, user } = await response.json();
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = id;
  const avatar = document.createElement("a");
  avatar.href = `/users/${comment.owner}`;
  if (!comment.avatarUrl) {
    const smileIcon = document.createElement("i");
    smileIcon.className = "fa-solid fa-face-smile";
    avatar.appendChild(smileIcon);
  } else {
    const avatarImage = document.createElement("img");
    avatarImage.src = `${comment.avatarUrl}`;
    avatarImage.className = "comment__avatar";
    avatar.appendChild(avatarImage);
  }
  const content = document.createElement("div");
  content.className = "comment__content";
  const username = document.createElement("a");
  username.href = `/users/${comment.owner}`;
  username.className = "commentUsername";
  username.innerText = comment.name;
  const span = document.createElement("span");
  span.className = "commentText";
  span.innerText = `  ${text}`;
  const commentLike = document.createElement("div");
  commentLike.className = "comment__like";
  const likeCommentBtn = document.createElement("i");
  likeCommentBtn.className = comment.likes.includes(user._id)
    ? "fas fa-thumbs-up likeCommentBtn"
    : "far fa-thumbs-up likeCommentBtn";
  const likeCount = document.createElement("span");
  likeCount.className = "likeCommentCount";
  likeCount.innerText = comment.likes.length;
  commentOption = document.createElement("i");
  commentOption.className = "commentOption fas fa-ellipsis-vertical";
  const option = document.createElement("div");
  option.className = "hidden option";
  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fas fa-trash";
  const deleteSpan = document.createElement("span");
  deleteSpan.innerText = "Delete";
  const deleteBtn = document.createElement("div");
  deleteBtn.className = "deleteBtn";
  const editSpan = document.createElement("span");
  editSpan.innerText = "Edit";
  const editIcon = document.createElement("i");
  editIcon.className = "fas fa-pen ";
  const editBtn = document.createElement("div");
  editBtn.className = "editBtn";
  const editModal = document.createElement("div");
  editModal.className = "hidden editModal";
  const editCommentForm = document.createElement("form");
  editCommentForm.className = "editCommentForm";
  const editCommentArea = document.createElement("textarea");
  editCommentArea.value = `${text}`;
  editCommentArea.className = "editCommentArea";
  editCommentArea.rows = "1";
  const saveEditBtn = document.createElement("button");
  saveEditBtn.className = "saveEditBtn";
  saveEditBtn.innerText = "Edit";
  const cancelEditBtn = document.createElement("button");
  cancelEditBtn.className = "cancelEditBtn";
  cancelEditBtn.innerText = "Cancel";

  newComment.prepend(avatar);
  editModal.prepend(editCommentForm);
  editCommentForm.prepend(editCommentArea);
  editCommentForm.appendChild(saveEditBtn);
  editCommentForm.appendChild(cancelEditBtn);
  newComment.appendChild(editModal);
  content.prepend(username);
  content.appendChild(span);
  commentLike.prepend(likeCommentBtn);
  commentLike.appendChild(likeCount);
  content.appendChild(commentLike);
  newComment.appendChild(content);
  deleteBtn.prepend(deleteIcon);
  deleteBtn.appendChild(deleteSpan);
  option.prepend(editBtn);
  editBtn.prepend(editIcon);
  editBtn.appendChild(editSpan);
  option.appendChild(deleteBtn);
  commentOption.prepend(option);
  newComment.appendChild(commentOption);
  videoComments.prepend(newComment);

  if (commentOption) {
    commentOption.addEventListener("click", handleOption);
  }
  if (deleteBtn) {
    deleteBtn.addEventListener("click", handleDeleteComment);
  }
  if (editBtn) {
    editBtn.addEventListener("click", showEditModal);
  }
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", cancelEditComment);
  }
  if (saveEditBtn) {
    saveEditBtn.addEventListener("click", handleEditComment);
  }
  if (likeCommentBtn) {
    likeCommentBtn.addEventListener("click", handleLikeComment);
  }
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const { id } = videoContainer.dataset;
  if (text.trim() === "") {
    return;
  }
  const response = await fetch(`/api/videos/${id}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  textarea.value = "";
  if (response.status === 201) {
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};
if (form) {
  form.addEventListener("submit", handleSubmit);
}
const handleDeleteComment = async (event) => {
  const li = event.currentTarget.parentElement.parentElement.parentElement;
  const commentId = li.dataset.id;
  const response = await fetch(`/api/comments/${commentId}/delete`, {
    method: "DELETE",
  });
  if (response.status === 200) {
    li.remove();
  }
};
if (deleteBtn) {
  deleteBtn.forEach((btn) =>
    btn.addEventListener("click", handleDeleteComment)
  );
}

const handleOption = (event) => {
  const option = event.currentTarget.querySelector(".option");
  option.classList.toggle(HIDDEN_CLASSNAME);
};
if (commentOptions) {
  commentOptions.forEach((commentOption) =>
    commentOption.addEventListener("click", handleOption)
  );
}

const showEditModal = (event) => {
  const editModal =
    event.currentTarget.parentElement.parentElement.parentElement.querySelector(
      ".editModal"
    );
  const comment__content =
    event.currentTarget.parentElement.parentElement.parentElement.querySelector(
      ".comment__content"
    );
  editModal.classList.remove(HIDDEN_CLASSNAME);
  comment__content.classList.add(HIDDEN_CLASSNAME);

  commentOptions.forEach((commentOption) =>
    commentOption.classList.add(HIDDEN_CLASSNAME)
  );
  if (commentOption) {
    commentOption.classList.add(HIDDEN_CLASSNAME);
  }
};
if (editBtn) {
  editBtn.forEach((btn) => btn.addEventListener("click", showEditModal));
}

const editingText = (editText, commentId) => {
  const li = document.querySelector(`.video__comment[data-id="${commentId}"]`);
  const span = li.querySelector(".commentText");
  span.innerText = editText;
};
const handleEditComment = async (event) => {
  event.preventDefault();
  const li = event.currentTarget.parentElement.parentElement.parentElement;
  const commentId = li.dataset.id;
  const editModal = event.currentTarget.parentElement.parentElement;
  const commentContent =
    event.currentTarget.parentElement.parentElement.parentElement.querySelector(
      ".comment__content"
    );
  const commentOption =
    event.currentTarget.parentElement.parentElement.parentElement.querySelector(
      ".commentOption"
    );
  const span =
    event.currentTarget.parentElement.parentElement.parentElement.querySelector(
      ".commentText"
    );
  const editCommentArea =
    event.currentTarget.parentElement.querySelector(".editCommentArea");
  const editText = editCommentArea.value;
  if (editText === "") {
    saveEditBtn.disabled = true;
  }
  const response = await fetch(`/api/comments/${commentId}/edit`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ editText }),
  });
  if (response.status === 200) {
    span.innerText = editText;
    editingText(editText, commentId);
    editModal.classList.add(HIDDEN_CLASSNAME);
    commentContent.classList.remove(HIDDEN_CLASSNAME);
    commentOption.classList.remove(HIDDEN_CLASSNAME);
  }
};
if (saveEditBtn) {
  saveEditBtn.forEach((btn) =>
    btn.addEventListener("click", handleEditComment)
  );
}

const cancelEditComment = (event) => {
  event.preventDefault();
  const editModal =
    event.currentTarget.parentElement.parentElement.parentElement.querySelector(
      ".editModal"
    );
  const comment__content =
    event.currentTarget.parentElement.parentElement.parentElement.querySelector(
      ".comment__content"
    );
  editModal.classList.add(HIDDEN_CLASSNAME);
  comment__content.classList.remove(HIDDEN_CLASSNAME);
  commentOptions.forEach((commentOption) =>
    commentOption.classList.remove(HIDDEN_CLASSNAME)
  );
  if (commentOption) {
    commentOption.classList.remove(HIDDEN_CLASSNAME);
  }
};

if (cancelEditBtn) {
  cancelEditBtn.forEach((btn) =>
    btn.addEventListener("click", cancelEditComment)
  );
}

const likeCommentCounting = (commentId, likesCommentCount) => {
  const li = document.querySelector(`.video__comment[data-id="${commentId}"]`);
  const likeCommentCount = li.querySelector(".likeCommentCount");
  const likeBtn = li.querySelector(".likeCommentBtn");
  if (likeBtn.classList.contains("fas")) {
    likeBtn.className = "far fa-thumbs-up likeCommentBtn";
  } else {
    likeBtn.className = "fas fa-thumbs-up likeCommentBtn";
  }
  likeCommentCount.innerText = `${likesCommentCount}`;
};

const handleLikeComment = async (event) => {
  try {
    const li = event.currentTarget.parentElement.parentElement.parentElement;
    const commentId = li.dataset.id;
    const response = await fetch(`/api/comments/${commentId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      const { likesCommentCount } = await response.json();
      likeCommentCounting(commentId, likesCommentCount);
    } else {
      console.error("Failed to update likes. Server returned an error.");
    }
  } catch (error) {
    console.error("An error occurred during the like operation:", error);
  }
};
if (likeCommentBtn) {
  likeCommentBtn.forEach((btn) =>
    btn.addEventListener("click", handleLikeComment)
  );
}
