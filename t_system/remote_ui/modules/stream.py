#!/usr/bin/python3
# -*- coding: utf-8 -*-

"""
.. module:: stream
    :platform: Unix
    :synopsis: the top-level submodule of T_System's remote_ui that contains the functions for managing of t_system's video and audio stream.

.. moduleauthor:: Cem Baybars GÜÇLÜ <cem.baybars@gmail.com>
"""

import threading

from t_system import seer
from t_system import log_manager

logger = log_manager.get_logger(__name__, "DEBUG")


class StreamManager:
    """Class to define a manager for asynchronous work of t_system's online video stream.

        This class provides necessary initiations and a function named
        :func:`t_system.remote_ui.modules.stream.StreamManager.get_stream`
        for the provide getting stream by calling iteratively the seer's current_frame member.
    """

    def __init__(self):
        """Initialization method of :class:`t_system.remote_ui.modules.stream.StreamManager` class.
        """

        self.stop_thread = False
        self.watch_thread = threading.Thread(target=seer.watch, args=(lambda: self.stop_thread, "bgr", "initial"))

    def start_stream(self, admin_id, stream_type):
        """Method to start video streaming.

        Args:
                admin_id (str):                 Root privileges flag.
                stream_type (str):               Stream's purpose. Preview, track-learn mode etc.
        """
        if not seer.is_watching:
            self.watch_thread = threading.Thread(target=seer.watch, args=(lambda: self.stop_thread, "bgr", stream_type))
            self.watch_thread.start()

        return self.get_stream, "multipart/x-mixed-replace; boundary=frame"

    def stop_stream(self, admin_id, stream_type):
        """Method to stop continuing video stream.

        Args:
                admin_id (str):                 Root privileges flag.
                stream_type (str):               Stream's purpose. Preview, track-learn mode etc.
        """
        result = False

        logger.debug(f'Video stream stopping for {stream_type}. And preview thread is alive {self.watch_thread.is_alive()}')

        self.stop_thread = True

        if self.watch_thread.is_alive():
            self.watch_thread.join()
            logger.debug("Stream stopped")
            result = True

        self.stop_thread = False

        return result

    def get_stream(self):
        """Method to get camera stream frame by frame from seer.current_frame.
        """
        logger.debug("frame sending processes starting")

        while True:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + seer.serve_frame_online() + b'\r\n')
            if self.stop_thread:
                logger.debug("Frame yielding process stopping...")  # this block is never triggered, but looks like no problem. Why?
                break

            # time.sleep(0.066)  # 1/15. for becoming the stream 15 fps.
