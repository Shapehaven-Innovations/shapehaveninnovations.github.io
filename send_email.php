<?php
// send_email.php

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Sanitize and validate inputs
    $name = htmlspecialchars(trim($_POST["name"] ?? ""), ENT_QUOTES, "UTF-8");
    $email = filter_var(trim($_POST["email"] ?? ""), FILTER_SANITIZE_EMAIL);
    $topic = htmlspecialchars(trim($_POST["topic"] ?? ""), ENT_QUOTES, "UTF-8");
    $message = htmlspecialchars(trim($_POST["message"] ?? ""), ENT_QUOTES, "UTF-8");

    // Basic validation
    if (empty($name) || empty($email) || empty($topic) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Redirect back with error flag
        header("Location: support.html?status=error");
        exit;
    }

    // Prepare mail headers and body
    $to = "info@shapehaveninnovations.org";
    $subject = "Support Request: $topic";

    $body  = "Name: $name\n";
    $body .= "Email: $email\n";
    $body .= "Topic: $topic\n\n";
    $body .= "Message:\n$message\n";

    // From header should be a valid address on your domain 
    // (some hosts refuse mail() if From is an external domain).
    $headers  = "From: noreply@shapehaveninnovations.org\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Send the email
    if (mail($to, $subject, $body, $headers)) {
        // Success → redirect back with ?status=success
        header("Location: support.html?status=success");
        exit;
    } else {
        // Failure → redirect back with ?status=error
        header("Location: support.html?status=error");
        exit;
    }
} else {
    // If someone navigates directly to send_email.php, just redirect back
    header("Location: support.html");
    exit;
}
?>
