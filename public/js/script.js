// public/js/script.js
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop();

  const clearMessage = (el) => {
    if (el) el.textContent = '';
  };

  if (path === 'index.html' || path === '' || path === '/') {
    // Login page
    const loginForm = document.getElementById('loginForm');
    const messageEl = document.getElementById('message');
    clearMessage(messageEl);

    loginForm && loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = loginForm.username.value.trim();
      const password = loginForm.password.value.trim();

      if (!username || !password) {
        messageEl.textContent = 'Please fill all fields.';
        messageEl.classList.remove('success');
        return;
      }

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.status === 200) {
          messageEl.textContent = data.message;
          messageEl.classList.add('success');
          localStorage.setItem('username', username);
          setTimeout(() => {
            window.location.href = 'choice.html';
          }, 800);
        } else {
          messageEl.textContent = data.message || 'Login failed.';
          messageEl.classList.remove('success');
        }
      } catch (err) {
        messageEl.textContent = 'Server error. Please try later.';
        messageEl.classList.remove('success');
        console.error(err);
      }
    });
  }

  if (path === 'register.html') {
    // Register page
    const registerForm = document.getElementById('registerForm');
    const messageEl = document.getElementById('message');
    clearMessage(messageEl);

    registerForm && registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = registerForm.username.value.trim();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value.trim();

      if (!username || !email || !password) {
        messageEl.textContent = 'Please fill all fields.';
        messageEl.classList.remove('success');
        return;
      }

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        if (res.status === 201) {
          messageEl.textContent = data.message;
          messageEl.classList.add('success');
          localStorage.setItem('username', username);
          setTimeout(() => {
            window.location.href = 'choice.html';
          }, 1000);
        } else {
          messageEl.textContent = data.message || 'Registration failed.';
          messageEl.classList.remove('success');
        }
      } catch (err) {
        messageEl.textContent = 'Server error. Please try later.';
        messageEl.classList.remove('success');
        console.error(err);
      }
    });
  }

  if (path === 'feedback.html') {
    // Feedback page
    const form = document.getElementById('feedbackForm');
    const messageEl = document.getElementById('message');
    clearMessage(messageEl);

    const usernameField = document.getElementById('username');
    const storedUsername = localStorage.getItem('username');
    if (usernameField) {
      usernameField.value = storedUsername || 'anonymous';
    }

    form && form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = usernameField.value.trim();
      const product = form.product.value.trim();
      const brand = form.brand.value.trim();
      const app = form.app.value.trim();
      const rating = form.rating.value;
      const opinion = form.opinion.value.trim();
      const imageInput = form.image;

      if (!username || username === 'anonymous') {
        messageEl.textContent = 'You must be logged in to submit feedback.';
        messageEl.classList.remove('success');
        return;
      }
      if (!product || !brand || !app || !opinion || !rating) {
        messageEl.textContent = 'Please fill all fields including rating.';
        messageEl.classList.remove('success');
        return;
      }

      const formData = new FormData();
      formData.append('username', username);
      formData.append('product', product);
      formData.append('brand', brand);
      formData.append('app', app);
      formData.append('rating', rating);
      formData.append('opinion', opinion);

      if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
      }

      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (res.status === 201) {
          messageEl.textContent = data.message;
          messageEl.classList.add('success');
          form.reset();
          usernameField.value = storedUsername || 'anonymous';
        } else {
          messageEl.textContent = data.message || 'Failed to submit feedback.';
          messageEl.classList.remove('success');
        }
      } catch (err) {
        messageEl.textContent = 'Server error. Please try later.';
        messageEl.classList.remove('success');
        console.error(err);
      }
    });

    const backChoice = document.getElementById('backChoice');
    if (backChoice) {
      backChoice.addEventListener('click', () => window.location.href = 'choice.html');
    }
  }

  if (path === 'search.html') {
    // Search page
    const searchForm = document.getElementById('searchForm');
    const resultsDiv = document.getElementById('results');

    searchForm && searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = searchForm.searchQuery.value.trim();

      resultsDiv.innerHTML = '<p>Searching...</p>';

      if (!query) {
        resultsDiv.innerHTML = '<p>Please enter a product name.</p>';
        return;
      }

      try {
        const res = await fetch(`/api/search?product=${encodeURIComponent(query)}`);

        if (res.ok) {
          const results = await res.json();

          if (!results.length) {
            resultsDiv.innerHTML = '<p>No feedback found for this product.</p>';
            return;
          }

          resultsDiv.innerHTML = results.map(fb => `
            <div class="feedback-entry" style="border-bottom:1px solid #004080; padding:0.75rem 0;">
              <strong>User:</strong> ${fb.username}<br />
              <strong>Product:</strong> ${fb.product}<br />
              <strong>Brand:</strong> ${fb.brand}<br />
              <strong>App:</strong> ${fb.app}<br />
              <strong>Rating:</strong> ${fb.rating ? fb.rating + ' / 5' : 'N/A'}<br />
              ${fb.imageUrl ? `<img src="${fb.imageUrl}" alt="Feedback Image" style="max-width: 100%; max-height: 200px; border-radius: 10px; margin-top: 8px;" />` : ''}
              <p>${fb.opinion}</p>
              <small>${new Date(fb.createdAt).toLocaleString()}</small>
            </div>
          `).join('');
        } else {
          const data = await res.json();
          resultsDiv.textContent = data.message || 'Failed to fetch results.';
        }
      } catch (err) {
        resultsDiv.textContent = 'Server error. Please try later.';
        console.error(err);
      }
    });

    const backChoice = document.getElementById('backChoice');
    if (backChoice) {
      backChoice.addEventListener('click', () => window.location.href = 'choice.html');
    }
  }

  if (path === 'contact.html') {
    // Contact page
    const contactForm = document.getElementById('contactForm');
    const messageEl = document.getElementById('message');
    clearMessage(messageEl);

    contactForm && contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !email || !message) {
        messageEl.textContent = 'Please fill all fields.';
        messageEl.classList.remove('success');
        return;
      }

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        });

        const data = await res.json();

        if (res.ok) {
          messageEl.textContent = data.message || 'Message sent successfully.';
          messageEl.classList.add('success');
          contactForm.reset();
        } else {
          messageEl.textContent = data.message || 'Failed to send message.';
          messageEl.classList.remove('success');
        }
      } catch (err) {
        messageEl.textContent = 'Server error. Please try later.';
        messageEl.classList.remove('success');
        console.error('Contact form error:', err);
      }
    });
  }
});

// // public/js/script.js
// document.addEventListener('DOMContentLoaded', () => {
//   const path = window.location.pathname.split('/').pop();

//   const clearMessage = (el) => {
//     if (el) el.textContent = '';
//   };

//   if (path === 'index.html' || path === '' || path === '/') {
//     const loginForm = document.getElementById('loginForm');
//     const messageEl = document.getElementById('message');
//     clearMessage(messageEl);

//     loginForm && loginForm.addEventListener('submit', async (e) => {
//       e.preventDefault();
//       const username = loginForm.username.value.trim();
//       const password = loginForm.password.value.trim();

//       if (!username || !password) {
//         messageEl.textContent = 'Please fill all fields.';
//         messageEl.classList.remove('success');
//         return;
//       }

//       try {
//         const res = await fetch('/api/login', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ username, password }),
//         });

//         const data = await res.json();

//         if (res.status === 200) {
//           messageEl.textContent = data.message;
//           messageEl.classList.add('success');
//           localStorage.setItem('username', username);
//           setTimeout(() => {
//             window.location.href = 'choice.html';
//           }, 800);
//         } else {
//           messageEl.textContent = data.message || 'Login failed.';
//           messageEl.classList.remove('success');
//         }
//       } catch (err) {
//         messageEl.textContent = 'Server error. Please try later.';
//         messageEl.classList.remove('success');
//         console.error(err);
//       }
//     });
//   }

//   if (path === 'register.html') {
//     const registerForm = document.getElementById('registerForm');
//     const messageEl = document.getElementById('message');
//     clearMessage(messageEl);

//     registerForm && registerForm.addEventListener('submit', async (e) => {
//       e.preventDefault();
//       const username = registerForm.username.value.trim();
//       const email = registerForm.email.value.trim();
//       const password = registerForm.password.value.trim();

//       if (!username || !email || !password) {
//         messageEl.textContent = 'Please fill all fields.';
//         messageEl.classList.remove('success');
//         return;
//       }

//       try {
//         const res = await fetch('/api/register', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ username, email, password }),
//         });

//         const data = await res.json();

//         if (res.status === 201) {
//           messageEl.textContent = data.message;
//           messageEl.classList.add('success');
//           localStorage.setItem('username', username);
//           setTimeout(() => {
//             window.location.href = 'index.html';
//           }, 1000);
//         } else {
//           messageEl.textContent = data.message || 'Registration failed.';
//           messageEl.classList.remove('success');
//         }
//       } catch (err) {
//         messageEl.textContent = 'Server error. Please try later.';
//         messageEl.classList.remove('success');
//         console.error(err);
//       }
//     });
//   }

//   if (path === 'feedback.html') {
//     const form = document.getElementById('feedbackForm');
//     const messageEl = document.getElementById('message');
//     clearMessage(messageEl);

//     const usernameField = document.getElementById('username');
//     const storedUsername = localStorage.getItem('username');
//     if (usernameField) {
//       usernameField.value = storedUsername || 'anonymous';
//     }

//     form && form.addEventListener('submit', async (e) => {
//       e.preventDefault();

//       const username = usernameField.value.trim();
//       const product = form.product.value.trim();
//       const brand = form.brand.value.trim();
//       const app = form.app.value.trim();
//       const rating = form.rating.value;
//       const opinion = form.opinion.value.trim();
//       const imageInput = form.image;

//       if (!username || username === 'anonymous') {
//         messageEl.textContent = 'You must be logged in to submit feedback.';
//         messageEl.classList.remove('success');
//         return;
//       }
//       if (!product || !brand || !app || !opinion || !rating) {
//         messageEl.textContent = 'Please fill all fields including rating.';
//         messageEl.classList.remove('success');
//         return;
//       }

//       const formData = new FormData();
//       formData.append('username', username);
//       formData.append('product', product);
//       formData.append('brand', brand);
//       formData.append('app', app);
//       formData.append('rating', rating);
//       formData.append('opinion', opinion);

//       if (imageInput.files.length > 0) {
//         formData.append('image', imageInput.files[0]);
//       }

//       try {
//         const res = await fetch('/api/feedback', {
//           method: 'POST',
//           body: formData,
//         });

//         const data = await res.json();

//         if (res.status === 201) {
//           messageEl.textContent = data.message;
//           messageEl.classList.add('success');
//           form.reset();
//           usernameField.value = storedUsername || 'anonymous';
//         } else {
//           messageEl.textContent = data.message || 'Failed to submit feedback.';
//           messageEl.classList.remove('success');
//         }
//       } catch (err) {
//         messageEl.textContent = 'Server error. Please try later.';
//         messageEl.classList.remove('success');
//         console.error(err);
//       }
//     });

//     const backChoice = document.getElementById('backChoice');
//     if (backChoice) {
//       backChoice.addEventListener('click', () => window.location.href = 'choice.html');
//     }
//   }

//   if (path === 'search.html') {
//     const searchForm = document.getElementById('searchForm');
//     const resultsDiv = document.getElementById('results');

//     searchForm && searchForm.addEventListener('submit', async (e) => {
//       e.preventDefault();
//       const query = searchForm.searchQuery.value.trim();

//       resultsDiv.innerHTML = '<p>Searching...</p>';

//       if (!query) {
//         resultsDiv.innerHTML = '<p>Please enter a product name.</p>';
//         return;
//       }

//       try {
//         const res = await fetch(`/api/search?product=${encodeURIComponent(query)}`);

//         if (res.ok) {
//           const results = await res.json();

//           if (!results.length) {
//             resultsDiv.innerHTML = '<p>No feedback found for this product.</p>';
//             return;
//           }

//           resultsDiv.innerHTML = results.map(fb => `
//             <div class="feedback-entry" style="border-bottom:1px solid #004080; padding:0.75rem 0;">
//               <strong>User:</strong> ${fb.username}<br />
//               <strong>Product:</strong> ${fb.product}<br />
//               <strong>Brand:</strong> ${fb.brand}<br />
//               <strong>App:</strong> ${fb.app}<br />
//               <strong>Rating:</strong> ${fb.rating ? fb.rating + ' / 5' : 'N/A'}<br />
//               ${fb.imageUrl ? `<img src="${fb.imageUrl}" alt="Feedback Image" style="max-width: 100%; max-height: 200px; border-radius: 10px; margin-top: 8px;" />` : ''}
//               <p>${fb.opinion}</p>
//               <small>${new Date(fb.createdAt).toLocaleString()}</small>
//             </div>
//           `).join('');
//         } else {
//           const data = await res.json();
//           resultsDiv.textContent = data.message || 'Failed to fetch results.';
//         }
//       } catch (err) {
//         resultsDiv.textContent = 'Server error. Please try later.';
//         console.error(err);
//       }
//     });

//     const backChoice = document.getElementById('backChoice');
//     if (backChoice) {
//       backChoice.addEventListener('click', () => window.location.href = 'choice.html');
//     }
//   }

//   if (path === 'contact.html') {
//     const contactForm = document.getElementById('contactForm');
//     const messageEl = document.getElementById('message');
//     clearMessage(messageEl);

//     contactForm && contactForm.addEventListener('submit', async (e) => {
//       e.preventDefault();

//       const name = contactForm.name.value.trim();
//       const email = contactForm.email.value.trim();
//       const message = contactForm.message.value.trim();

//       if (!name || !email || !message) {
//         messageEl.textContent = 'Please fill all fields.';
//         messageEl.classList.remove('success');
//         return;
//       }

//       try {
//         const res = await fetch('/api/contact', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ name, email, message }),
//         });

//         const data = await res.json();

//         if (res.ok) {
//           messageEl.textContent = data.message || 'Message sent successfully.';
//           messageEl.classList.add('success');
//           contactForm.reset();
//         } else {
//           messageEl.textContent = data.message || 'Failed to send message.';
//           messageEl.classList.remove('success');
//         }
//       } catch (err) {
//         messageEl.textContent = 'Server error. Please try later.';
//         messageEl.classList.remove('success');
//         console.error('Contact form error:', err);
//       }
//     });
//   }
// });