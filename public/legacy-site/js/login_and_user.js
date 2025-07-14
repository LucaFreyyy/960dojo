async function checkLoginStatus() {
    const session = await getSession();
    const dropdown = document.getElementById("dropdownContent");
    dropdown.innerHTML = "";

    if (session?.user) {
        dropdown.innerHTML = `
            <a onclick="openSettings()">Info</a>
            <a onclick="logout()">Logout</a>
        `;
        document.getElementById("loginName").textContent = session.user.name || session.user.email;
        window.window.userInfo = {
            name: session.user.name,
            email: session.user.email,
            rating: session.user.rating, // if you store rating on the session
        };
    } else {
        dropdown.innerHTML = `
            <a onclick="openSettings()">Info</a>
            <a onclick="startLogin()">Login</a>
        `;
        document.getElementById("loginName").textContent = "";
        selectMode('training');
        window.window.userInfo = null;
    }
}

function openSettings() {
    const message = `
        <div style="color: #000;">
            <p>For any kind of suggestion or feedback please contact me:<br>
            <a href="mailto:lucafreyq@gmail.com">lucafreyq@gmail.com</a></p>
        </div>
    `;
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = 0;
    modal.style.top = 0;
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.3)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = 10000;

    const box = document.createElement('div');
    box.style.background = '#fff';
    box.style.padding = '24px';
    box.style.borderRadius = '8px';
    box.style.maxWidth = '400px';
    box.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    box.style.color = '#000';
    box.innerHTML = message;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.marginTop = '16px';
    closeBtn.onclick = () => document.body.removeChild(modal);

    box.appendChild(closeBtn);
    modal.appendChild(box);
    document.body.appendChild(modal);
}

function startLogin() {
    signIn('google');
}

function logout() {
    signOut();
}
