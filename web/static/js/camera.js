navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    document.getElementById("video").srcObject = stream;
});

function capture() {
    let video = document.getElementById("video");
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, 640, 480);

    canvas.toBlob((blob) => {
        let file = new File([blob], "capture.png", { type: "image/png" });

        let formData = new FormData();
        formData.append("username", document.getElementById("username").value);
        formData.append("first_name", document.getElementById("first_name").value);
        formData.append("last_name", document.getElementById("last_name").value);
        formData.append("gender", document.getElementById("gender").value);
        formData.append("address", document.getElementById("address").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("phone", document.getElementById("phone_number").value);
        formData.append("city", document.getElementById("city").value);
        formData.append("state", document.getElementById("state").value);
        formData.append("country", document.getElementById("country").value);
        formData.append("image", file);

        fetch("/register/", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        })
        .catch(error => console.error("Error:", error));
    }, "image/png");
}

function login() {
    let video = document.getElementById("video");
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, 640, 480);

    canvas.toBlob((blob) => {
        let file = new File([blob], "capture.png", { type: "image/png" });

        let username = document.getElementById("username").value;
        if (!username) {
            alert("Please enter your username!");
            return;
        }

        let formData = new FormData();
        formData.append("username", username);
        formData.append("image", file);

        let url = window.location.pathname.includes("register") ? "/register/" : "/login/";

        fetch(url, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.redirect) {
                window.location.href = data.redirect; // Redirect to login page after successful registration
            }
        })
        .catch(error => console.error("Error:", error));
    }, "image/png");
}
function captureFamily() {
    let video = document.getElementById("video");
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, 640, 480);

    canvas.toBlob((blob) => {
        let file = new File([blob], "family_capture.png", { type: "image/png" });

        let formData = new FormData();
        formData.append("username", document.getElementById("username").value);
        formData.append("account_username", document.getElementById("account_username").value);
        formData.append("name", document.getElementById("name").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("phone", document.getElementById("phone").value);
        formData.append("relationship", document.getElementById("relationship").value);
        formData.append("image", file);

        fetch("/register_family/", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())

        .then(data => {
            alert(data.message);
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        })
        .catch(error => console.error("Error:", error));
    }, "image/png");
}

function familyLogin() {
    let video = document.getElementById("video");
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, 640, 480);

    canvas.toBlob((blob) => {
        let file = new File([blob], "family_login.png", { type: "image/png" });

        let formData = new FormData();
        formData.append("username", document.getElementById("username").value);
        formData.append("image", file);

        fetch("/family_login/", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        })
        .catch(error => console.error("Error:", error));
    }, "image/png");
}

function faceVerify() {
    let video = document.getElementById("video");
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, 640, 480);

    canvas.toBlob((blob) => {
        let file = new File([blob], "verify.png", { type: "image/png" });

        let formData = new FormData();
        formData.append("image", file);

        fetch("/face_verification/", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        })
        .catch(error => console.error("Error:", error));
    }, "image/png");
}

