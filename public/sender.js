const input = document.querySelector("#roomID");
const roomId = document.querySelector(".roomId");
const btn = document.querySelector(".btn");
const screen = document.querySelector(".screen");

(function () {
  const socket = io();

  let receiverID;

  const generateRandom = () => {
    return Math.floor(Math.random() * 1000);
  };
  const generateId = () => {
    return `${generateRandom()}-${generateRandom()}-${generateRandom()}`;
  };

  btn.addEventListener("click", () => {
    let joinID = generateId();
    input.value = joinID;
    socket.emit("sender-join", {
      uid: joinID,
    });
  });

  socket.on("init", (uid) => {
    receiverID = uid;
    screen.classList.remove("hidden");
    roomId.classList.remove("hidden");
  });

  document.querySelector("#file-input").addEventListener("change", (e) => {
    let file = e.target.files[0];
    if (!file) {
      return;
    }
    let reader = new FileReader();
    reader.onload = function (e) {
      let buffer = new Uint8Array(reader.result);

      let el = document.createElement("div");
      el.classList.add("item");
      el.innerHTML = `
        <div class="progress">0%</div>
        <div class="filename">${file.name}</div`;

      document.querySelector(".files-list").appendChild(el);
      shareFile(
        {
          filename: file.name,
          total_buffer_size: buffer.length,
          buffer_size: 1024,
        },
        buffer,
        el.querySelector(".progress")
      );
    };
    reader.readAsArrayBuffer(file);
  });

  function shareFile(metadata, buffer, progress_node) {
    socket.emit("file-meta", {
      uid: receiverID,
      metadata: metadata,
    });

    socket.on("fs-share", function () {
      let chunk = buffer.slice(0, metadata.buffer_size);
      buffer = buffer.slice(metadata.buffer_size, buffer.length);
      progress_node.innerText = Math.trunc(
        ((metadata.total_buffer_size - buffer.length) /
          metadata.total_buffer_size) *
          100
      );
      if (chunk.length != 0) {
        socket.emit("file-raw", {
          uid: receiverID,
          buffer: chunk,
        });
      } else {
        console.log("Sent file successfully");
      }
    });
  }
})();
