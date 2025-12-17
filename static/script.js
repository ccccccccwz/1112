document.addEventListener("DOMContentLoaded", function() {
    const toggles = document.querySelectorAll(".toggle");

    toggles.forEach(toggle => {
        toggle.addEventListener("click", function() {
            const parentRow = toggle.closest('tr');
            const isExpanded = parentRow.getAttribute("data-expanded") === "true";
            const parentId = parentRow.getAttribute("data-parent");
            const nextRows = getNextRows(parentRow);

            if (isExpanded) {
                toggle.textContent = "+";
                parentRow.setAttribute("data-expanded", "false");
                nextRows.forEach(row => row.style.display = "none");
            } else {
                toggle.textContent = "-";
                parentRow.setAttribute("data-expanded", "true");
                nextRows.forEach(row => {
                    if (row.getAttribute("data-parent") === parentRow.getAttribute("data-level")) {
                        row.style.display = "table-row";
                    }
                });
            }
        });
    });

    function getNextRows(row) {
        const rows = [];
        let nextRow = row.nextElementSibling;

        while (nextRow && parseInt(nextRow.getAttribute("data-level")) > parseInt(row.getAttribute("data-level"))) {
            rows.push(nextRow);
            nextRow = nextRow.nextElementSibling;
        }
        return rows;
    }
});