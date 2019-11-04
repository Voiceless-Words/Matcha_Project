
const canvas = document.getElementById("canvas");
const context = canvas.getContext('2d');
let flag = 0;
var check1 = "0";

function uploadPic() {
    flag = 2;
    document.getElementById('cap').disabled = true;
    const formdata = new FormData();
    const image = document.getElementById("fill");
    const file = image.files[0];
    const readers = new FileReader();
    readers.readAsDataURL(file);
    readers.onload = function () {
        var photo = readers.result;
        console.log("the variable" + photo);
        formdata.append("image", photo);
        const ajax = new XMLHttpRequest();
        ajax.open("POST", "../upload.php");
        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4 && ajax.status === 200) {
                console.log(ajax.responseText + "this is what we get back");
                if (ajax.responseText === "success") {
                    console.log(photo);
                    console.log("saved image");
                    document.getElementById("source").src = '../file2.png?' + new Date().getTime();
                } else if (ajax.responseText === "nothing") {
                    console.log("cant find it");
                }
            }
        };
        ajax.send(formdata);
    };
}

(function () {
        const video = document.getElementById("vid");
        const photo = document.getElementById("source");

        navigator.getMedia = navigator.getUserMedia;
        navigator.getMedia({video: true, audio: false}, function (stream) {
            video.srcObject = stream;
        }, function (error) {

        });
            document.getElementById("cap").addEventListener("click", function () {
                context.drawImage(video, 0, 0, 400, 300);
                photo.setAttribute('src', canvas.toDataURL('image/png'));
                flag = 1;
                check1 = "1";
            });
})();

function  savePhoto() {
    const formdata = new FormData();
    if (flag === 2){
        const image1 = new Image();
        image1.src = '../file2.png';
        formdata.append("image1", image1.src);
    }else {
        const image = canvas.toDataURL('image/png');
        formdata.append("image", image);
    }
    const  image2 = document.getElementById("frame").src;
    const  image3 = document.getElementById("frame2").src;
    console.log(image2);
        if (flag === 1 || flag === 2) {
            formdata.append("image2", image2);
            formdata.append("image3", image3);
            formdata.append("check", check1);
            const ajax = new XMLHttpRequest();
            ajax.open("POST", "../save.php");
            ajax.onreadystatechange = function () {
                if (ajax.readyState === 4 && ajax.status === 200) {
                    if (ajax.responseText === "success") {
                        console.log("saved image");
                        document.getElementById("source").src = '../noframe.png';
                    } else if (ajax.responseText === "nothing") {
                        console.log("cant find it");
                    }
                }
            };
            ajax.send(formdata);
            flag = 3;
        }
    document.getElementById('cap').disabled = false;
}

function frameChange() {
    if(flag === 1)
    {
        const formdata = new FormData();
        const image = canvas.toDataURL('image/png');
        formdata.append("image", image);
        const image3 = document.getElementById("frame2").src;
        const image2 = document.getElementById("frame").src;
        if (flag === 1) {
            formdata.append("image2", image2);
            formdata.append("image3", image3);
            console.log(image2 + "user");
            const ajax = new XMLHttpRequest();
            ajax.open("POST", "../save.php");
            ajax.onreadystatechange = function () {
                if (ajax.readyState === 4 && ajax.status === 200) {
                    if (ajax.responseText === "success") {
                        console.log("saved image");
                        document.getElementById("source").src = '../file.png?' + new Date().getTime();
                    } else if (ajax.responseText === "nothing") {
                        console.log("cant find it");
                    }
                }
            };
            ajax.send(formdata);
        }
    }else {
        document.getElementById("source").src = pic;
    }
}

