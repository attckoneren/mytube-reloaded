# Mytube Reloaded

/ => home
/join => join
/login => Login
/search => Search

/users/:id => Sea user profile
/users/logout =>Logout
/users/edit => Edit my profile
/users/remove => Delete my profile

/videos/:id => See Video
/videos/:id/edit => Edit video
/videos/:id/delete => Delete video
/videos/upload => Upload video

/videos/comments => Comment on a video
/videos/comments/remove =? Delete comment

      .set__option {
        height: 100px;
        width: 140px;
        border-radius: 10px;
        background-color: #282828;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1;
        position: absolute;
        bottom: -115px;
        left: -10px;
        font-size: 13px;

        i {
          margin-left: 10px;
        }

        .editBox {
          width: 95%;
          padding: 12px 0px;
          &:hover {
            background-color: gray;
          }
        }
        .deleteBox {
          width: 95%;
          padding: 12px 0px;
          &:hover {
            background-color: gray;
          }
        }
        a {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
            sans-serif;
          margin-left: 10px;
        }
      }
