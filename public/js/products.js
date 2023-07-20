function addToCart(pid) {
  const cid = document.getElementById("cartId").value;
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `/api/carts/${cid}/product/${pid}`;
  document.body.appendChild(form);
  form.submit();
}

function deleteFromCart(pid) {
  const cid = document.getElementById("cartId").value;
  const url = `/api/carts/${cid}/product/${pid}`;
  fetch(url, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        location.reload();
      } else {
        console.log("Failed to remove product from cart");
      }
    })
    .catch((error) => {
      console.log("Error occurred while removing product from cart:", error);
    });
}
