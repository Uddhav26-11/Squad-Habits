function Login() {

  const handleGoogleLogin = () => {
    window.location.href =
      "https://2gbrq124-5000.inc1.devtunnels.ms/auth/google";
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-950">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">

        <h1 className="text-3xl font-bold mb-2">
          Squad Habits
        </h1>

        <p className="text-gray-500 mb-6">
          Track habits together 🚀
        </p>

        <button

          onClick={handleGoogleLogin}

          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"

        >
          Continue with Google
        </button>

      </div>

    </div>

  );

}

export default Login;