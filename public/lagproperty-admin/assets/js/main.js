document.addEventListener("DOMContentLoaded", function () {
  class General {
    constructor() {
      //this.domain="https://lagproperty.onrender.com/api/v1/"
      this.domain = "http://178.62.5.186:5000/api/v1/";
      //this.domain="http://localhost:5000/api/v1/"

      this.token = localStorage.getItem("token");
      this.restrictedPathsNoLogin = ["login"];
      this.navigateM = this.navigateM.bind(this);
      this.postData = this.postData.bind(this);
      this.runFirst();
    }

    isTokenAvailable() {
      return !!localStorage.getItem("token");
    }
    runFirst() {
      const basePath = this.getBasePath(window.location.pathname);

      $("#Logout").click(function () {
        myGeneral.logout();
      });

      // Check if the current path is in the restricted paths and if the token is available
      if (
        this.restrictedPathsNoLogin.includes(basePath) &&
        this.isTokenAvailable()
      ) {
        // Redirect to home page
        //window.location.href = "/index.html";
        this.navigateM("/index.html");
      } else if (
        this.restrictedPathsNoLogin.includes(basePath) ===
        this.isTokenAvailable()
      ) {
        this.navigateM("/login.html");
      }
    }
    removeItemFromLocalStorage(key) {
      localStorage.removeItem(key);
    }
    logout() {
      localStorage.removeItem("token");
      this.navigateM("/login.html");
    }
    getById(id, data) {
      return data.find((item) => item.id === id);
    }
    postData(path, data, button, buttonL, callback) {
      $("#errorMessage").text("");

      if (!navigator.onLine) {
        $("#errorMessage").text("You are offline");

        if (buttonL) {
          $(`#${buttonL}`).hide();
        }
        if (button) {
          $(`#${button}`).show();
        }

        return;
      }
      const token = this.token || "";

      try {
        $.ajax({
          url: this.domain + path,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(data),
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          success: (response) => {
            //this.hideLoader();
            const response2 = response.data;

            if (callback) {
              callback();
            }

            if (buttonL) {
              $(`#${buttonL}`).hide();
            }
            if (button) {
              $(`#${button}`).show();
            }

            if (path === "auth/loginUser") {
              $.notify(
                {
                  icon: "icon-check",
                  title: "success",
                  message: "welcome to lagproperty",
                },
                {
                  type: "success",
                  placement: {
                    from: "top",
                    align: "right",
                  },
                  time: 400,
                }
              );

              setTimeout(() => {
                localStorage.setItem("token", response2.token);
                localStorage.setItem("user", JSON.stringify(response2.user));

                this.navigateM("index.html");
              }, 2000);
            }
          },
          error: function (error) {
            if (error.responseJSON.message === "Invalid token.") {
              myGeneral.logout();
            }

            if (callback) {
              callback();
            }

            if (buttonL) {
              $(`#${buttonL}`).hide();
            }
            if (button) {
              $(`#${button}`).show();
            }

            if (path === "auth/loginUser") {
              $("#errorMessage").text(error.responseJSON.message);
            }
          },
        });
      } catch (error) {
        if (callback) {
          callback();
        }

        if (buttonL) {
          $(`#${buttonL}`).hide();
        }
        if (button) {
          $(`#${button}`).show();
        }
      }
    }

    getData(path, callback, query, loader) {
      if (!navigator.onLine) {
        $("#errorMessage").text("You are offline");
        return;
      }

      const token = this.token || "";
      const queryString = query
        ? "?" + new URLSearchParams(query).toString()
        : "";

      try {
        $.ajax({
          url: this.domain + path + queryString,
          type: "GET",
          contentType: "application/json",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          success: (response) => {
            const response2 = response.data;

            if (loader) {
              console.log("dddddddd");
              $(`#${loader}`).css("display", "none");
            }
            callback(response2);
          },
          error: function (error) {
            if (error.responseJSON.message === "Invalid token.") {
              myGeneral.logout();
            }
            if (loader) {
              $(`#${loader}`).css("display", "none");
            }
            if (path === "auth/loginUser") {
              $("#errorMessage").text(error.responseJSON.message);
            }
          },
        });
      } catch (error) {
        console.log(error);
        if (loader) {
          $(`#${loader}`).css("display", "none");
        }
      }
    }

    navigateM(path) {
      window.location.href = path;
    }
    getBasePath(path) {
      const fileName = path.split("/").pop();
      // Remove the ".html" extension if it exists
      const basePath = fileName.replace(/\.html$/, "");
      return basePath;
    }
    appendHtmlToDiv(htmlContent, divId) {
      const div = document.getElementById(divId);
      if (div) {
        div.innerHTML += htmlContent;
      } else {
        console.error(`Div with ID "${divId}" not found.`);
      }
    }
    generateTransactionTable(transactions) {
      const statusSucess = ["completed", "paid"];

      console.log(statusSucess.includes("paid"));
      if (!Array.isArray(transactions)) {
        console.error("Invalid transactions array.");
        return "";
      }

      return transactions
        .map(
          (transaction) => `
        <tr>
          <td scope="row">
            <button class="btn btn-icon btn-round btn-sm me-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
              </svg>
            </button>
            ${transaction.paymentReference}
          </td>
          <td scope="row">${transaction.transactionType}</td>
          <td class="text-end">${new Date(
            transaction.updatedAt
          ).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}</td>
          <td class="text-end">₦ ${transaction.amount}</td>
          <td class="text-end">
            <span class="badge ${
              statusSucess.includes(transaction.paymentStatus) === true
                ? "badge-success"
                : "badge-warning"
            }">${transaction.paymentStatus}</span>
          </td>
        </tr>`
        )
        .join("");
    }

    generateLandlordTable(landlords) {
      if (!Array.isArray(landlords)) {
        console.error("Invalid landlords array.");
        return "";
      }

      return landlords
        .map(
          (landlord) => `
          <tr>
            <td>
              <div class="avatar-sm">
                <img
                  src="${landlord.image}"
                  alt="Profile Picture"
                  class="avatar-img rounded-circle"
                />
              </div>
            </td>
            <td>${landlord.companyName || "N/A"}</td>
            <td>${landlord.firstName} ${landlord.lastName}</td>
            <td>${landlord.emailAddress}</td>
            <td>${landlord.tel}</td>
            <td>${landlord.tenantCount}</td>
            <td>${landlord.buildingCount}</td>
            <td>
              <a data-id="${
                landlord.id
              }"   type="button" class="btn btn-primary view-landlord-btn">View</a>
            </td>
          </tr>`
        )
        .join("");
    }
    generateTenantTable(tenants) {
      if (!Array.isArray(tenants)) {
        console.error("Invalid tenants array.");
        return "";
      }
      console.log(tenants);
      return tenants
        .map(
          (tenant) => `
          <tr>
            <td>
              <div class="avatar-sm">
                <img
                  src="${tenant.image}"
                  alt="Profile Picture"
                  class="avatar-img rounded-circle"
                />
              </div>
            </td>
            <td>${tenant.firstName} ${tenant.lastName}</td>
            <td>${tenant.isProfileCompleted ? "Yes" : "No"}</td>
            <td>${tenant.emailAddress}</td>
            <td>${tenant.telCode}${tenant.tel}</td>
            <td>${tenant.gender || "N/A"}</td>
            <td>${tenant.lasrraId || "N/A"}</td>
            <td>${tenant.country || "N/A"}</td>
          </tr>`
        )
        .join("");
    }
  }

  const myGeneral = new General();

  const currentPath = window.location.pathname;
  const basePath = myGeneral.getBasePath(currentPath);

  if (basePath === "login") {
    // Show the Loading button
    const form = document.getElementById("loginForm");
    $(`#loginButtonL`).hide();

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      $("#loginButtonL").show();
      $("#loginButton").hide();

      // Get the input values
      const email = document.getElementById("emailInput").value;
      const password = document.getElementById("passwordInput").value;

      /*
        // Check if both fields are filled
        if (!email || !password) {
            alert('Both fields are required.');
            return;
        }*/

      // Proceed with the submission (you can send the data to the server here)
      const data = {
        emailAddress: email,
        password: password,
        type: "admin",
      };

      /* 
        const data ={
          firstName:"chinaza",
          lastName:"ogbonna",
          emailAddress:"admin@gmail.com", 
          password:"admin100",
          image:"sssss",
          privilege:"admin",
          type:"admin"
        }

        console.log('Form submitted:', data);*/

      myGeneral.postData("auth/loginUser", data, "loginButton", "loginButtonL");
    });
  } else if (basePath === "index") {
    //$("#profileid").attr('src', 'assets/img/profile.jpg');
    const user = JSON.parse(localStorage.getItem("user"));
    $("#userEmail").text(user.emailAddress);
    $("#userName").text(user.firstName + " " + user.lastName);
    $("#userName2").text(user.firstName);
    $(".my-avatar").attr("src", user.image);

    function callback(data) {
      $("#Owner").text(data.propertyManagerCount);
      $("#Building").text(data.BuildingCount);
      $("#Tenant").text(data.tenantCount);
      $("#PropectiveT").text(data.prospectiveTenantCount);
    }

    function callback2(data) {
      $("#Escrow").text("₦" + data.totalEscrowBalance);
    }

    function callback3(data) {
      $("#Balance").text("₦" + data.currentBalance);
    }

    function callback4(data) {
      console.log(data.length);

      if (data.length > 0) {
        $("#alertTransaction").css("display", "none");
        const htmlContent = myGeneral.generateTransactionTable(data);
        myGeneral.appendHtmlToDiv(htmlContent, "transactionID");
      } else {
      }
    }

    const query = {
      limit: 10,
    };

    myGeneral.getData("user/getCount", callback);
    myGeneral.getData("user/getTotalEscrowBalance", callback2);
    myGeneral.getData("user/getIncome", callback3);
    myGeneral.getData("user/getAllTrasaction", callback4, query, "loader");
  } else if (basePath === "transaction") {
    const user = JSON.parse(localStorage.getItem("user"));
    $("#userEmail").text(user.emailAddress);
    $("#userName").text(user.firstName + " " + user.lastName);
    $("#userName2").text(user.firstName);
    $(".my-avatar").attr("src", user.image);

    function callback(data) {
      /*
      data = [
        {
          id: "#10231-23333-3333939",
          type: "commission",
          date: "Mar 19, 2020, 2.45pm",
          amount: "₦ 250.00",
          status: "Completed",
        },
        {     
          id: "#10232-23333-3333940",
          type: "payment",
          date: "Mar 20, 2020, 1.15pm",
          amount: "₦ 300.00",
          status: "Pending",
        },
        {
          id: "#10231-23333-3333939",
          type: "commission",
          date: "Mar 19, 2020, 2.45pm",
          amount: "₦ 250.00",
          status: "Completed",
        },
        {     
          id: "#10232-23333-3333940",
          type: "payment",
          date: "Mar 20, 2020, 1.15pm",
          amount: "₦ 300.00",
          status: "Pending",
        },
        {
          id: "#10231-23333-3333939",
          type: "commission",
          date: "Mar 19, 2020, 2.45pm",
          amount: "₦ 250.00",
          status: "Completed",
        },
        {     
          id: "#10232-23333-3333940",
          type: "payment",
          date: "Mar 20, 2020, 1.15pm",
          amount: "₦ 300.00",
          status: "Pending",
        },
        {     
          id: "#10232-23333-3333940",
          type: "payment",
          date: "Mar 20, 2020, 1.15pm",
          amount: "₦ 300.00",
          status: "Pending",
        }, {     
          id: "#10232-23333-3333940",
          type: "payment",
          date: "Mar 20, 2020, 1.15pm",
          amount: "₦ 300.00",
          status: "Pending",
        }, {     
          id: "#10232-23333-3333940",
          type: "payment",
          date: "Mar 20, 2020, 1.15pm",
          amount: "₦ 300.00",
          status: "Pending",
        }, {     
          id: "#10232-23333-3333940",
          type: "payment",
          date: "Mar 20, 2020, 1.15pm",
          amount: "₦ 300.00",
          status: "Pending",
        }, {     
          id: "#10232-23333-3333940",
          type: "payment",
          date: "Mar 20, 2020, 1.15pm",
          amount: "₦ 300.00",
          status: "Pending",
        }, {     
          id: "#10232-23333-3333940",
          type: "payment",
          date: "Mar 20, 2020, 1.15pm",
          amount: "₦ 300.00",
          status: "Pending",
        }, {     
          id: "#10232-23333-3333940",
          type: "payment",
          date: "Mar 20, 2020, 1.15pm",
          amount: "₦ 300.00",
          status: "Pending",
        }, {     
          id: "#10232-23333-3333940",
          type: "payment",
          date: "Mar 20, 2020, 1.15pm",
          amount: "₦ 300.00",
          status: "Pending",
        },
      ];*/
      if (data.length > 0) {
        $("#alertTransaction").css("display", "none");
        $("#tfoot").css("display", "none");

        const htmlContent = myGeneral.generateTransactionTable(data);
        myGeneral.appendHtmlToDiv(htmlContent, "transactionID");

        //initiatilize the datatable
        $("#basic-datatables").DataTable({});

        $("#multi-filter-select").DataTable({
          pageLength: 5,
          initComplete: function () {
            this.api()
              .columns()
              .every(function () {
                var column = this;
                var select = $(
                  '<select class="form-select"><option value=""></option></select>'
                )
                  .appendTo($(column.footer()).empty())
                  .on("change", function () {
                    var val = $.fn.dataTable.util.escapeRegex($(this).val());

                    column
                      .search(val ? "^" + val + "$" : "", true, false)
                      .draw();
                  });

                column
                  .data()
                  .unique()
                  .sort()
                  .each(function (d, j) {
                    select.append(
                      '<option value="' + d + '">' + d + "</option>"
                    );
                  });
              });
          },
        });

        // Add Row
        $("#add-row").DataTable({
          pageLength: 5,
        });

        var action =
          '<td> <div class="form-button-action"> <button type="button" data-bs-toggle="tooltip" title="" class="btn btn-link btn-primary btn-lg" data-original-title="Edit Task"> <i class="fa fa-edit"></i> </button> <button type="button" data-bs-toggle="tooltip" title="" class="btn btn-link btn-danger" data-original-title="Remove"> <i class="fa fa-times"></i> </button> </div> </td>';

        $("#addRowButton").click(function () {
          $("#add-row")
            .dataTable()
            .fnAddData([
              $("#addName").val(),
              $("#addPosition").val(),
              $("#addOffice").val(),
              action,
            ]);
          $("#addRowModal").modal("hide");
        });
      } else {
      }
    }

    myGeneral.getData("user/getAllTrasaction", callback, {}, "loader");
  } else if (basePath === "landlord") {
    const user = JSON.parse(localStorage.getItem("user"));
    $("#userEmail").text(user.emailAddress);
    $("#userName").text(user.firstName + " " + user.lastName);
    $("#userName2").text(user.firstName);
    $(".my-avatar").attr("src", user.image);

    function viewLandlordDetails(data) {
      console.log(data);

      //myGeneral.navigateM("/building.html")
    }

    function callback(data) {
      if (data.length > 0) {
        $("#alertlandlord").css("display", "none");

        const htmlContent = myGeneral.generateLandlordTable(data);
        myGeneral.appendHtmlToDiv(htmlContent, "landlordID");
      }

      //initiatilize the datatable
      $("#basic-datatables").DataTable({});

      $("#multi-filter-select").DataTable({
        pageLength: 5,
        initComplete: function () {
          this.api()
            .columns()
            .every(function () {
              var column = this;
              var select = $(
                '<select class="form-select"><option value=""></option></select>'
              )
                .appendTo($(column.footer()).empty())
                .on("change", function () {
                  var val = $.fn.dataTable.util.escapeRegex($(this).val());

                  column.search(val ? "^" + val + "$" : "", true, false).draw();
                });

              column
                .data()
                .unique()
                .sort()
                .each(function (d, j) {
                  select.append('<option value="' + d + '">' + d + "</option>");
                });
            });
        },
      });

      // Add Row
      $("#add-row").DataTable({
        pageLength: 5,
      });

      var action =
        '<td> <div class="form-button-action"> <button type="button" data-bs-toggle="tooltip" title="" class="btn btn-link btn-primary btn-lg" data-original-title="Edit Task"> <i class="fa fa-edit"></i> </button> <button type="button" data-bs-toggle="tooltip" title="" class="btn btn-link btn-danger" data-original-title="Remove"> <i class="fa fa-times"></i> </button> </div> </td>';

      $("#addRowButton").click(function () {
        $("#add-row")
          .dataTable()
          .fnAddData([
            $("#addName").val(),
            $("#addPosition").val(),
            $("#addOffice").val(),
            action,
          ]);
        $("#addRowModal").modal("hide");
      });

      const tableBody = document.getElementById("landlordID"); // Ensure your table body has this ID
      if (tableBody) {
        // Attach event listeners to the "View" buttons
        const viewButtons = tableBody.querySelectorAll(".view-landlord-btn");
        viewButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const landlordId = button.getAttribute("data-id");
            viewLandlordDetails(landlordId);
          });
        });
      }
    }

    const myquery = {
      type: "list",
    };

    myGeneral.getData("user/getAllUser", callback, myquery, "loader");
  } else if (basePath === "tenant-prop") {
    const myquery = {
      type: "rent",
    };
    const user = JSON.parse(localStorage.getItem("user"));
    $("#userEmail").text(user.emailAddress);
    $("#userName").text(user.firstName + " " + user.lastName);
    $("#userName2").text(user.firstName);
    $(".my-avatar").attr("src", user.image);

    function callback(data) {
      if (data.length > 0) {
        $("#alerttenant").css("display", "none");

        const htmlContent = myGeneral.generateTenantTable(data);
        myGeneral.appendHtmlToDiv(htmlContent, "tenantTableID");

        //initiatilize the datatable
        $("#basic-datatables").DataTable({});

        $("#multi-filter-select").DataTable({
          pageLength: 5,
          initComplete: function () {
            this.api()
              .columns()
              .every(function () {
                var column = this;
                var select = $(
                  '<select class="form-select"><option value=""></option></select>'
                )
                  .appendTo($(column.footer()).empty())
                  .on("change", function () {
                    var val = $.fn.dataTable.util.escapeRegex($(this).val());

                    column
                      .search(val ? "^" + val + "$" : "", true, false)
                      .draw();
                  });

                column
                  .data()
                  .unique()
                  .sort()
                  .each(function (d, j) {
                    select.append(
                      '<option value="' + d + '">' + d + "</option>"
                    );
                  });
              });
          },
        });

        // Add Row
        $("#add-row").DataTable({
          pageLength: 5,
        });

        var action =
          '<td> <div class="form-button-action"> <button type="button" data-bs-toggle="tooltip" title="" class="btn btn-link btn-primary btn-lg" data-original-title="Edit Task"> <i class="fa fa-edit"></i> </button> <button type="button" data-bs-toggle="tooltip" title="" class="btn btn-link btn-danger" data-original-title="Remove"> <i class="fa fa-times"></i> </button> </div> </td>';

        $("#addRowButton").click(function () {
          $("#add-row")
            .dataTable()
            .fnAddData([
              $("#addName").val(),
              $("#addPosition").val(),
              $("#addOffice").val(),
              action,
            ]);
          $("#addRowModal").modal("hide");
        });
      }
    }

    myGeneral.getData("user/getAllUser", callback, myquery, "loader");
  } else if (basePath === "setting") {
    const user = JSON.parse(localStorage.getItem("user"));
    $("#userEmail").text(user.emailAddress);
    $("#userName").text(user.firstName + " " + user.lastName);
    $("#userName2").text(user.firstName);
    $(".my-avatar").attr("src", user.image);

    // Function to add a new preference to the table
    function addPreferenceToTable(preference) {
      const tbody = document.getElementById("preferencesTable");
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${preference}</td>
          <td class="text-end">
              <button class="btn btn-sm btn-outline-danger" onclick="removePreference(this)">
                  <i class="fas fa-trash"></i>
              </button>
          </td>
      `;
      tbody.appendChild(row);
    }

    // Function to remove a preference
    function removePreference(button) {
      button.closest("tr").remove();
    }

    // Form submission handler
    document
      .getElementById("settingsForm")
      .addEventListener("submit", function (e) {
        e.preventDefault();

        // Collect all preferences
        const preferences = {};
        document
          .querySelectorAll("#preferencesTable tr")
          .forEach((row, index) => {
            const preference = row.cells[0].textContent;
            preferences[`pref${index + 1}`] = preference;
          });

        const settings = {
          commissionPercentage: parseFloat(
            document.getElementById("commissionPercentage").value
          ),
          appPercentage: parseFloat(
            document.getElementById("appPercentage").value
          ),
          accountNumber: document.getElementById("accountNumber").value,
          failedDisburseRetry: parseInt(
            document.getElementById("failedDisburseRetry").value
          ),
          failedRefundRetry: parseInt(
            document.getElementById("failedRefundRetry").value
          ),
          pendingDisburseRetry: parseInt(
            document.getElementById("pendingDisburseRetry").value
          ),
          pendingDisburseRentRetry: parseInt(
            document.getElementById("pendingDisburseRentRetry").value
          ),
          appShare: parseInt(document.getElementById("appShare").value),
          preferences: preferences,
          notificationAllowed: document.getElementById("notificationAllowed")
            .checked,
        };

        console.log("Settings to save:", settings);
        // Here you would typically make an API call to save the settings
      });

    function callback(data) {
      if (typeof data === "string") {
        try {
          const parsedData = JSON.parse(data); // Safely parse the JSON string
          data = parsedData || [];
        } catch (error) {
          console.error("Invalid JSON string", error);
        }
      }

      let preferences = data.buildingPreferences.map((item, index) => ({
        id: index + 1,
        name: item,
      }));

      // Pagination settings
      const itemsPerPage = 20;
      let currentPage = 1;
      let filteredPreferences = [...preferences];

      function showLoading(show = true) {
        $("#loading").toggle(show);
      }

      function renderPreferences() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPreferences = filteredPreferences.slice(
          startIndex,
          endIndex
        );

        const list = $("#preferenceList");
        list.empty();

        currentPreferences.forEach((pref) => {
          list.append(`
                  <div class="preference-item p-2 border-bottom d-flex justify-content-between align-items-center" data-id="${pref.id}">
                      <span>${pref.name}</span>
                      <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                  </div>
              `);
        });

        updatePagination();
        updateItemCount();
      }

      function updatePagination() {
        const totalPages = Math.ceil(filteredPreferences.length / itemsPerPage);
        const pagination = $("#pagination");
        pagination.empty();

        // Previous button
        pagination.append(`
              <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
                  <a class="page-link" href="#" data-page="${
                    currentPage - 1
                  }">Previous</a>
              </li>
          `);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
          if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 2 && i <= currentPage + 2)
          ) {
            pagination.append(`
                      <li class="page-item ${
                        i === currentPage ? "active" : ""
                      }">
                          <a class="page-link" href="#" data-page="${i}">${i}</a>
                      </li>
                  `);
          } else if (i === currentPage - 3 || i === currentPage + 3) {
            pagination.append(`
                      <li class="page-item disabled">
                          <a class="page-link" href="#">...</a>
                      </li>
                  `);
          }
        }

        // Next button
        pagination.append(`
              <li class="page-item ${
                currentPage === totalPages ? "disabled" : ""
              }">
                  <a class="page-link" href="#" data-page="${
                    currentPage + 1
                  }">Next</a>
              </li>
          `);
      }

      function updateItemCount() {
        $("#itemsShown").text(
          Math.min(currentPage * itemsPerPage, filteredPreferences.length)
        );
        $("#totalItems").text(filteredPreferences.length);
      }

      // Event Handlers
      $(document).ready(function () {
        renderPreferences();

        // Pagination click handler
        $("#pagination").on("click", ".page-link", function (e) {
          e.preventDefault();
          const newPage = parseInt($(this).data("page"));
          if (!isNaN(newPage) && newPage !== currentPage) {
            currentPage = newPage;
            renderPreferences();
          }
        });

        // Search handler
        $("#searchBox").on("input", function () {
          const searchTerm = $(this).val().toLowerCase();
          filteredPreferences = preferences.filter((pref) =>
            pref.name.toLowerCase().includes(searchTerm)
          );
          currentPage = 1;
          renderPreferences();
        });

        // Delete handler
        $("#preferenceList").on("click", ".delete-btn", function () {
          const id = $(this).parent().data("id");
          showLoading();

          console.log(id);
          const combination = [...preferences, ...filteredPreferences];
          const uniqueBuildingPreferences = [...new Set(combination)];
          console.log(uniqueBuildingPreferences);
          const result = myGeneral.getById(id, uniqueBuildingPreferences);

          const mydata = {
            type: "deleted",
            preferenceName: result.name,
          };

          function callback3() {
            preferences = preferences.filter((pref) => pref.id !== id);
            filteredPreferences = filteredPreferences.filter(
              (pref) => pref.id !== id
            );
            renderPreferences();
            showLoading(false);
          }
          myGeneral.postData(
            "user/BuildingPreferenceAction",
            mydata,
            "",
            "",
            callback3
          );
        });

        // Add new preference
        $("#savePreference").click(function () {
          const newPrefName = $("#newPreference").val().trim();
          if (newPrefName) {
            showLoading();

            const data = {
              type: "add",
              preferenceName: newPrefName,
            };
            function callback2() {
              const newPref = {
                id: preferences.length + 1,
                name: newPrefName,
              };

              preferences.unshift(newPref);
              filteredPreferences = [...preferences];

              $("#newPreference").val("");
              $("#addPreferenceModal").modal("hide");
              currentPage = 1;
              renderPreferences();

              showLoading(false);
            }

            myGeneral.postData(
              "user/BuildingPreferenceAction",
              data,
              "",
              "",
              callback2
            );
          }
        });
      });
    }

    myGeneral.getData("user/getBuildingPreference", callback, {}, "loader");
  } else if (basePath === "memo") {
    const user = JSON.parse(localStorage.getItem("user"));
    $("#userEmail").text(user.emailAddress);
    $("#userName").text(user.firstName + " " + user.lastName);
    $("#userName2").text(user.firstName);
    $(".my-avatar").attr("src", user.image);
  }
});
