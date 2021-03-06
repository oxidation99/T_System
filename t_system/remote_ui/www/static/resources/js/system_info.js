// -*- coding: utf-8 -*-

/**
 * @module system_info
 * @fileoverview the top-level module of T_System that contains the communication methods with python flask of T_System system_info API.
 * @author cem.baybars@gmail.com (Cem Baybars GÜÇLÜ)
 */


/** @type {!Element} */
const system_info_template_container = document.getElementById("system_info_template_container");
const system_info_div = document.getElementById("system_info_div");
const system_info_btn = document.getElementById("system_info_btn");
const system_info_chart_div = document.getElementById("system_info_chart_div");
const system_info_chart_cnv = document.getElementById('system_info_chart_cnv').getContext('2d');

const disk_usage_div = document.getElementById('disk_usage_div');
const d_u_title = document.getElementById('d_u_title');
const d_u_as_giga_min = document.getElementById('d_u_as_giga_min');

const versions_div = document.getElementById('versions_div');
const stand_version_p = document.getElementById('stand_version_p');
const remote_ui_version_p = document.getElementById('remote_ui_version_p');
const t_system_version_p = document.getElementById('t_system_version_p');

let system_info_chart;

function toggle_system_info_modal() {
    system_info_template_container.classList.toggle("focused");
    system_info_div.classList.toggle("focused");
    system_info_btn.classList.toggle("clicked");

    if (system_info_div.classList.contains("focused")) {  // 1. click

        set_system_info();

        if (dark_overlay_active) {
            dark_overlay_active = false
        } else {
            dark_deep_background_div.classList.toggle("focused");
            dark_overlay_active = true
        }
    } else {  // 2. click
        if (dark_overlay_active === false) {
            dark_overlay_active = true

        } else {
            dark_deep_background_div.classList.toggle("focused");
            dark_overlay_active = false
        }
        system_info_chart.destroy();
    }

    options_template_container.classList.toggle("hidden_element");
    controlling_template_container.classList.toggle("hidden_element");
    prepare_template_container.classList.toggle("hidden_element");
    job_template_container.classList.toggle("hidden_element");

}


/**
 * Method to set system info chart/table by administration or normal entry.
 */
function set_system_info() {

    request_asynchronous('/api/system_info?admin_id=' + admin_id, 'GET',
        'application/x-www-form-urlencoded; charset=UTF-8', null, function (requested_data, err) {
            // err = "success"
            // requested_data = {"status": "OK", "data": {"cpu_usage_percent": 15, "cpu_temperature": 37, "ram_usage_percent": 20, "disk_usage_percent": 55, "free_disk_space": 18, "versions": {"t_system": "0.9-alpha1.99", "stand": "0.3", "remote_ui": "1.8.7"}}};
            if (err === "success") {
                if (requested_data["status"] === "OK") {

                    let free_disk_space = requested_data["data"]["free_disk_space"];
                    let disk_usage_percentage = requested_data["data"]["disk_usage_percent"];
                    let cpu_usage_percentage = requested_data["data"]["cpu_usage_percent"];
                    let ram_usage_percentage = requested_data["data"]["ram_usage_percent"];
                    let cpu_temperature = requested_data["data"]["cpu_temperature"];
                    let t_system_version = requested_data["data"]["versions"]["t_system"];
                    let stand_version = requested_data["data"]["versions"]["stand"];
                    let remote_ui_version = requested_data["data"]["versions"]["remote_ui"];

                    d_u_title.innerHTML = translate_text_item("Available:");
                    d_u_as_giga_min.innerHTML = free_disk_space + " GB ~ " + Number((free_disk_space * 1024 / 2.4).toFixed(1)) + translate_text_item(" min");  // 1 min record spends 2.4 mb.

                    if (ram_usage_percentage === null) {

                        versions_div.classList.remove("active");
                        system_info_chart = new Chart(system_info_chart_cnv, {
                            "type": "doughnut",
                            "data": {
                                "labels": ["Disk Usage(%)", "Free(%)"],
                                "datasets": [{
                                    "label": "Disk Usage",
                                    "data": [disk_usage_percentage, 100 - disk_usage_percentage],
                                    "backgroundColor": [
                                        "rgb(210, 26, 11)",
                                        "rgb(238, 237, 233)"
                                    ],
                                    "borderWidth": 5,
                                    "borderColor": "rgba(0, 0, 0, 0.5)",
                                }],
                            },
                            "options": {
                                "legend": {
                                    "labels": {
                                        "fontColor": "white",
                                        "fontSize": 12
                                    }
                                },
                                "segmentShowStroke": true,
                                "segmentStrokeColor": "#fff",
                                "segmentStrokeWidth": 50,
                                "cutoutPercentage": 80,  // thin of the donut as inverse between 50-100.
                                "animation:": {
                                    "animationSteps": 100,
                                    "animationEasing": "easeOutBounce",
                                    "animateRotate": true,
                                    "animateScale": true
                                },
                                "responsive": true,
                                "maintainAspectRatio": true,
                                "showScale": true
                            }

                        });
                    } else {
                        system_info_chart = new Chart(system_info_chart_cnv, {
                            "type": "doughnut",
                            "data": {
                                "labels": ["Disk Usage(%)", "Ram Usage(%)", "CPU Usage(%)", "CPU temp.(*C)"],
                                "datasets": [{
                                    "label": "System Info",
                                    "data": [disk_usage_percentage, ram_usage_percentage, cpu_usage_percentage, cpu_temperature],
                                    "backgroundColor": [
                                        "rgb(210, 26, 11)",
                                        "rgb(57, 139, 255)",
                                        "rgb(255, 202, 37)",
                                        "rgb(93, 255, 172)"
                                    ],
                                    "borderWidth": 5,
                                    "borderColor": "rgba(0, 0, 0, 0.5)",
                                }],
                            },
                            "options": {
                                "legend": {
                                    "labels": {
                                        "fontColor": "white",
                                        "fontSize": 12
                                    }
                                },
                                "segmentShowStroke": true,
                                "segmentStrokeColor": "#fff",
                                "segmentStrokeWidth": 50,
                                "cutoutPercentage": 80,  // thin of the donut as inverse between 50-100.
                                "animation:": {
                                    "animationSteps": 100,
                                    "animationEasing": "easeOutBounce",
                                    "animateRotate": true,
                                    "animateScale": true
                                },
                                "responsive": true,
                                "maintainAspectRatio": true,
                                "showScale": true
                            }
                        });
                        versions_div.classList.add("active");
                        stand_version_p.innerHTML = "stand: v" + stand_version;
                        remote_ui_version_p.innerHTML = "remote_ui: v" + remote_ui_version;
                        t_system_version_p.innerHTML = "t_system: v" + t_system_version;
                    }
                }
            }
        });
}

system_info_div.addEventListener("click", function (event) {
    if (event.target === event.currentTarget) {
        toggle_system_info_modal()
    } else {
    }
});

system_info_btn.title = translate_text_item("System Info");
system_info_btn.addEventListener("click", toggle_system_info_modal);
